import { GeofenceService } from '../services/geofence.service';
import { IZone, IGeoPolygon } from '../models/types';

describe('GeofenceService Tests', () => {
  const mockPolygon: IGeoPolygon = {
    type: 'Polygon',
    coordinates: [
      [
        [77.5300, 7.9700],
        [77.6200, 7.9700],
        [77.6200, 8.0300],
        [77.5300, 8.0300],
        [77.5300, 7.9700]
      ]
    ]
  };

  const mockZone: IZone = {
    id: 'Z001',
    name: 'Test Offshore Security Zone',
    description: 'Test zone',
    zoneType: 'security',
    geometry: mockPolygon,
    severity: 'critical',
    warningDistance: 1500, // 1500 meters
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  describe('Haversine Distance', () => {
    it('should calculate distance between two identical points as 0', () => {
      const dist = GeofenceService.haversineDistance(8.078, 77.555, 8.078, 77.555);
      expect(dist).toBe(0);
    });

    it('should accurately calculate distance between Kanyakumari and an offshore point', () => {
      // 8.0780, 77.5550 to 8.0000, 77.5550 is ~0.078 deg latitude ~= 8.67 km
      const dist = GeofenceService.haversineDistance(8.078, 77.555, 8.000, 77.555);
      expect(dist).toBeGreaterThan(8000);
      expect(dist).toBeLessThan(9000);
    });
  });

  describe('Point-in-Polygon Ray Casting', () => {
    it('should return true for a point strictly inside the restricted polygon', () => {
      // Point inside mockPolygon [77.53 to 77.62, 7.97 to 8.03]
      const inside = GeofenceService.isPointInPolygon(8.0000, 77.5750, mockPolygon);
      expect(inside).toBe(true);
    });

    it('should return false for a point outside the restricted polygon', () => {
      // Point well south of the polygon
      const inside = GeofenceService.isPointInPolygon(7.9000, 77.5750, mockPolygon);
      expect(inside).toBe(false);
    });

    it('should return false for a point on the land / north of polygon', () => {
      const inside = GeofenceService.isPointInPolygon(8.0780, 77.5550, mockPolygon);
      expect(inside).toBe(false);
    });
  });

  describe('Zone Evaluation & Approaching Distance', () => {
    it('should identify a vessel inside the zone as isInside: true', () => {
      const assessments = GeofenceService.evaluateVesselZones(8.0000, 77.5750, [mockZone]);
      expect(assessments.length).toBe(1);
      expect(assessments[0].isInside).toBe(true);
    });

    it('should identify a vessel near the boundary as isApproaching: true', () => {
      // Lat 7.9620 is ~880m south of 7.9700 border (within 1500m warning buffer)
      const assessments = GeofenceService.evaluateVesselZones(7.9620, 77.5750, [mockZone]);
      expect(assessments.length).toBe(1);
      expect(assessments[0].isInside).toBe(false);
      expect(assessments[0].isApproaching).toBe(true);
      expect(assessments[0].distanceToBoundaryMeters).toBeLessThanOrEqual(1500);
    });

    it('should identify a vessel far away as neither inside nor approaching', () => {
      // Lat 7.9000 is ~7.8 km away
      const assessments = GeofenceService.evaluateVesselZones(7.9000, 77.5750, [mockZone]);
      expect(assessments.length).toBe(1);
      expect(assessments[0].isInside).toBe(false);
      expect(assessments[0].isApproaching).toBe(false);
      expect(assessments[0].distanceToBoundaryMeters).toBeGreaterThan(1500);
    });
  });
});
