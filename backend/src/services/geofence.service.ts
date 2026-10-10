import { IGeoPolygon, IZone } from '../models/types';

export interface IGeofenceAssessment {
  zoneId: string;
  zoneName: string;
  zoneType: string;
  severity: string;
  isInside: boolean;
  isApproaching: boolean;
  distanceToBoundaryMeters: number;
}

export class GeofenceService {
  private static readonly EARTH_RADIUS_METERS = 6371000;

  /**
   * Calculates Haversine distance between two coordinates in meters
   */
  public static haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const rLat1 = toRad(lat1);
    const rLat2 = toRad(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_METERS * c;
  }

  /**
   * Ray-casting algorithm to determine if a point (lat, lon) is inside a GeoJSON Polygon
   * GeoJSON polygon coordinates are in [longitude, latitude] order.
   */
  public static isPointInPolygon(
    lat: number,
    lon: number,
    geometry: IGeoPolygon
  ): boolean {
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
      return false;
    }

    const ring = geometry.coordinates[0]; // Exterior ring
    if (!ring || ring.length < 3) {
      return false;
    }

    let isInside = false;
    const n = ring.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = ring[i][0]; // lon_i
      const yi = ring[i][1]; // lat_i
      const xj = ring[j][0]; // lon_j
      const yj = ring[j][1]; // lat_j

      const intersect =
        yi > lat !== yj > lat &&
        lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

      if (intersect) {
        isInside = !isInside;
      }
    }

    return isInside;
  }

  /**
   * Calculates the minimum distance in meters from a point (lat, lon) to the boundary of a GeoJSON polygon
   */
  public static distanceToPolygonBoundary(
    lat: number,
    lon: number,
    geometry: IGeoPolygon
  ): number {
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
      return Infinity;
    }

    const ring = geometry.coordinates[0];
    if (!ring || ring.length < 2) {
      return Infinity;
    }

    let minDistance = Infinity;

    for (let i = 0; i < ring.length - 1; i++) {
      const p1 = { lon: ring[i][0], lat: ring[i][1] };
      const p2 = { lon: ring[i + 1][0], lat: ring[i + 1][1] };

      const dist = this.distanceToSegment(lat, lon, p1.lat, p1.lon, p2.lat, p2.lon);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }

    return minDistance;
  }

  /**
   * Distance from a point to a line segment in meters
   */
  private static distanceToSegment(
    pLat: number,
    pLon: number,
    aLat: number,
    aLon: number,
    bLat: number,
    bLon: number
  ): number {
    // Convert to planar projection centered on point for local accuracy
    const latMean = (aLat + bLat + pLat) / 3;
    const cosLat = Math.cos((latMean * Math.PI) / 180);

    const ax = (aLon * Math.PI * this.EARTH_RADIUS_METERS * cosLat) / 180;
    const ay = (aLat * Math.PI * this.EARTH_RADIUS_METERS) / 180;
    const bx = (bLon * Math.PI * this.EARTH_RADIUS_METERS * cosLat) / 180;
    const by = (bLat * Math.PI * this.EARTH_RADIUS_METERS) / 180;
    const px = (pLon * Math.PI * this.EARTH_RADIUS_METERS * cosLat) / 180;
    const py = (pLat * Math.PI * this.EARTH_RADIUS_METERS) / 180;

    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) {
      return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);
    }

    // Projection scalar t
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const projX = ax + t * dx;
    const projY = ay + t * dy;

    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
  }

  /**
   * Evaluates a vessel's position against all active zones
   */
  public static evaluateVesselZones(
    lat: number,
    lon: number,
    zones: IZone[]
  ): IGeofenceAssessment[] {
    const activeZones = zones.filter((z) => z.status === 'active');
    const assessments: IGeofenceAssessment[] = [];

    for (const zone of activeZones) {
      const isInside = this.isPointInPolygon(lat, lon, zone.geometry);
      const distanceToBoundary = this.distanceToPolygonBoundary(lat, lon, zone.geometry);
      const isApproaching = !isInside && distanceToBoundary <= zone.warningDistance;

      assessments.push({
        zoneId: zone.id,
        zoneName: zone.name,
        zoneType: zone.zoneType,
        severity: zone.severity,
        isInside,
        isApproaching,
        distanceToBoundaryMeters: Math.round(distanceToBoundary)
      });
    }

    return assessments;
  }
}
