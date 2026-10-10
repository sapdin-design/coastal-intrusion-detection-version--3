import { Server as SocketIOServer } from 'socket.io';
import { dbStore } from '../config/database';
import { GeofenceService, IGeofenceAssessment } from './geofence.service';
import { IVessel, VesselStatus, IAlert, IIncident } from '../models/types';
import { generateNmeaSentences } from '../utils/nmea';

export interface IIntrusionResult {
  vessel: IVessel;
  status: VesselStatus;
  primaryZoneAssessment?: IGeofenceAssessment;
  alertCreated?: IAlert;
  incidentCreated?: IIncident;
}

export class IntrusionService {
  private static alertCooldowns: Map<string, { status: VesselStatus; timestamp: number }> = new Map();
  private static ioInstance: SocketIOServer | null = null;

  public static setSocketIO(io: SocketIOServer) {
    this.ioInstance = io;
  }

  /**
   * Process a vessel location update, evaluate geofences, determine status, and trigger alerts/incidents
   */
  public static async processVesselLocation(
    vesselId: string,
    latitude: number,
    longitude: number,
    speed: number,
    heading: number
  ): Promise<IIntrusionResult> {
    const vessel = await dbStore.getVesselById(vesselId);
    if (!vessel) {
      throw new Error(`Vessel not found: ${vesselId}`);
    }

    const zones = await dbStore.getAllZones();
    const assessments = GeofenceService.evaluateVesselZones(latitude, longitude, zones);

    // Find if inside any zone or approaching
    const insideAssessment = assessments.find((a) => a.isInside);
    const approachingAssessment = assessments
      .filter((a) => a.isApproaching)
      .sort((a, b) => a.distanceToBoundaryMeters - b.distanceToBoundaryMeters)[0];

    // Determine state based on precedence: INTRUSION > APPROACHING > AUTHORIZED > NORMAL
    let newStatus: VesselStatus = 'normal';
    let primaryAssessment: IGeofenceAssessment | undefined = undefined;

    if (insideAssessment) {
      primaryAssessment = insideAssessment;
      if (vessel.authorizationStatus === 'unauthorized' || vessel.authorizationStatus === 'suspended') {
        newStatus = 'intrusion';
      } else {
        newStatus = 'normal'; // Authorized vessel in zone is allowed
      }
    } else if (approachingAssessment) {
      primaryAssessment = approachingAssessment;
      newStatus = 'approaching';
    } else {
      newStatus = 'normal';
    }

    const previousStatus = vessel.status;

    // Update vessel in database
    const updatedVessel = await dbStore.updateVessel(vesselId, {
      latitude,
      longitude,
      speed,
      heading,
      status: newStatus,
      nearestZoneId: primaryAssessment?.zoneId,
      nearestZoneDistance: primaryAssessment?.distanceToBoundaryMeters,
      isActive: true
    });

    // Record to location logs
    const nmea = generateNmeaSentences(latitude, longitude, speed, heading);
    await dbStore.addLocationLog({
      vesselId,
      vesselName: vessel.name,
      latitude,
      longitude,
      speed,
      heading,
      status: newStatus,
      nearestZoneId: primaryAssessment?.zoneId,
      nearestZoneDistance: primaryAssessment?.distanceToBoundaryMeters,
      rawNmea: nmea.rawNmea
    });

    let createdAlert: IAlert | undefined = undefined;
    let createdIncident: IIncident | undefined = undefined;

    // Check alert trigger and prevent duplicates
    const cooldownKey = `${vesselId}_${primaryAssessment?.zoneId || 'none'}`;
    const lastAlert = this.alertCooldowns.get(cooldownKey);
    const now = Date.now();
    const statusChanged = previousStatus !== newStatus;
    const cooldownExpired = !lastAlert || now - lastAlert.timestamp > 30000; // 30s re-trigger interval if persistent

    if ((statusChanged || cooldownExpired) && (newStatus === 'intrusion' || newStatus === 'approaching')) {
      if (newStatus === 'intrusion' && primaryAssessment) {
        // Humanized Alert Message
        const message = `CRITICAL — Unauthorized vessel '${vessel.name}' (${vessel.id}) has entered restricted zone '${primaryAssessment.zoneName}' (${primaryAssessment.zoneId}).`;
        
        createdAlert = await dbStore.createAlert({
          vesselId: vessel.id,
          vesselName: vessel.name,
          zoneId: primaryAssessment.zoneId,
          zoneName: primaryAssessment.zoneName,
          alertType: 'Unauthorized Entry',
          severity: 'critical',
          latitude,
          longitude,
          message,
          status: 'new'
        });

        // Automatically create Incident
        createdIncident = await dbStore.createIncident({
          alertId: createdAlert.id,
          vesselId: vessel.id,
          vesselName: vessel.name,
          zoneId: primaryAssessment.zoneId,
          zoneName: primaryAssessment.zoneName,
          severity: 'critical',
          title: `Maritime Intrusion: ${vessel.name} in ${primaryAssessment.zoneName}`,
          description: `Unauthorized vessel entered maritime restricted zone at ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E. Automated tracking initiated.`,
          status: 'open',
          timeline: [
            {
              timestamp: new Date(Date.now() - 15000).toISOString(),
              event: 'Zone Approach Detected',
              details: `Target vessel approached warning perimeter of ${primaryAssessment.zoneName}.`
            },
            {
              timestamp: new Date().toISOString(),
              event: 'Restricted Boundary Crossed',
              details: `Intrusion confirmed. Critical alert ${createdAlert.id} dispatched to coastal operators.`
            }
          ]
        });

        this.alertCooldowns.set(cooldownKey, { status: newStatus, timestamp: now });

        if (this.ioInstance) {
          this.ioInstance.emit('intrusion:detected', {
            vessel: updatedVessel,
            alert: createdAlert,
            incident: createdIncident,
            zone: primaryAssessment
          });
          this.ioInstance.emit('alert:created', createdAlert);
          this.ioInstance.emit('incident:created', createdIncident);
        }
      } else if (newStatus === 'approaching' && primaryAssessment && vessel.authorizationStatus === 'unauthorized') {
        const distanceStr = primaryAssessment.distanceToBoundaryMeters >= 1000
          ? `${(primaryAssessment.distanceToBoundaryMeters / 1000).toFixed(1)} km`
          : `${primaryAssessment.distanceToBoundaryMeters} m`;

        const message = `WARNING — Vessel '${vessel.name}' (${vessel.id}) is ${distanceStr} from '${primaryAssessment.zoneName}' and approaching boundary at ${speed.toFixed(1)} knots.`;

        createdAlert = await dbStore.createAlert({
          vesselId: vessel.id,
          vesselName: vessel.name,
          zoneId: primaryAssessment.zoneId,
          zoneName: primaryAssessment.zoneName,
          alertType: 'Zone Approach',
          severity: 'high',
          latitude,
          longitude,
          message,
          status: 'new'
        });

        this.alertCooldowns.set(cooldownKey, { status: newStatus, timestamp: now });

        if (this.ioInstance) {
          this.ioInstance.emit('zone:approach', {
            vessel: updatedVessel,
            alert: createdAlert,
            zone: primaryAssessment
          });
          this.ioInstance.emit('alert:created', createdAlert);
        }
      }
    }

    // Always emit location update over Socket.IO
    if (this.ioInstance && updatedVessel) {
      this.ioInstance.emit('vessel:location_updated', {
        vessel: updatedVessel,
        rawNmea: nmea.rawNmea,
        primaryAssessment
      });

      if (statusChanged) {
        this.ioInstance.emit('vessel:status_changed', {
          vesselId,
          previousStatus,
          currentStatus: newStatus
        });
      }
    }

    return {
      vessel: updatedVessel || vessel,
      status: newStatus,
      primaryZoneAssessment: primaryAssessment,
      alertCreated: createdAlert,
      incidentCreated: createdIncident
    };
  }

  public static resetCooldowns() {
    this.alertCooldowns.clear();
  }
}
