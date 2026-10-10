import { IntrusionService } from '../services/intrusion.service';
import { dbStore } from '../config/database';

describe('IntrusionService Tests', () => {
  beforeEach(() => {
    dbStore.seed();
    IntrusionService.resetCooldowns();
  });

  it('should detect unauthorized entry as INTRUSION and create Critical Alert & Incident', async () => {
    // V005 is unauthorized fishing boat
    // Place inside Z001 [7.97 to 8.03 N, 77.53 to 77.62 E]
    const result = await IntrusionService.processVesselLocation('V005', 8.0000, 77.5750, 14.5, 5);

    expect(result.status).toBe('intrusion');
    expect(result.vessel.status).toBe('intrusion');
    expect(result.alertCreated).toBeDefined();
    expect(result.alertCreated?.severity).toBe('critical');
    expect(result.alertCreated?.alertType).toBe('Unauthorized Entry');
    expect(result.incidentCreated).toBeDefined();
    expect(result.incidentCreated?.status).toBe('open');
    expect(result.incidentCreated?.timeline.length).toBeGreaterThan(0);
  });

  it('should allow authorized vessels into restricted zones without triggering intrusion alert', async () => {
    // V001 is authorized Sea Guardian Patrol Boat
    // Place inside Z001
    const result = await IntrusionService.processVesselLocation('V001', 8.0000, 77.5750, 16.0, 90);

    expect(result.status).toBe('normal');
    expect(result.vessel.status).toBe('normal');
    expect(result.alertCreated).toBeUndefined();
    expect(result.incidentCreated).toBeUndefined();
  });

  it('should detect approaching vessel and create warning alert', async () => {
    // V005 near boundary of Z001 (~880m away)
    const result = await IntrusionService.processVesselLocation('V005', 7.9620, 77.5750, 13.0, 0);

    expect(result.status).toBe('approaching');
    expect(result.vessel.status).toBe('approaching');
    expect(result.alertCreated).toBeDefined();
    expect(result.alertCreated?.alertType).toBe('Zone Approach');
  });
});
