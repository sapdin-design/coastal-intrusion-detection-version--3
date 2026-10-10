import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { socketService } from '../services/socket';
import { audioService } from '../services/audio';
import {
  IVessel,
  IZone,
  IAlert,
  IIncident,
  IDashboardStats,
  ISimulatorStatus,
  SimulationScenario
} from '../types';

interface MonitoringContextType {
  vessels: IVessel[];
  zones: IZone[];
  alerts: IAlert[];
  incidents: IIncident[];
  stats: IDashboardStats | null;
  simulator: ISimulatorStatus;
  selectedVessel: IVessel | null;
  selectedZone: IZone | null;
  latestNmea: string;
  isAudioMuted: boolean;
  activeIntrusionNotification: { vessel: IVessel; alert: IAlert; zoneName: string } | null;
  // Methods
  selectVessel: (vessel: IVessel | null) => void;
  selectZone: (zone: IZone | null) => void;
  dismissIntrusionNotification: () => void;
  toggleAudioMute: () => void;
  startSimulation: (scenario?: SimulationScenario, speed?: number) => Promise<void>;
  pauseSimulation: () => Promise<void>;
  resumeSimulation: () => Promise<void>;
  stopSimulation: () => Promise<void>;
  resetSimulation: () => Promise<void>;
  setSimulationSpeed: (speed: number) => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  updateIncidentStatus: (id: string, status: string, notes?: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const defaultSimulatorStatus: ISimulatorStatus = {
  isRunning: false,
  isPaused: false,
  scenario: 'intrusion_demo',
  speedMultiplier: 1,
  activeVesselsCount: 0,
  currentTick: 0,
  elapsedSeconds: 0,
  lastUpdate: new Date().toISOString()
};

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

export const MonitoringProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vessels, setVessels] = useState<IVessel[]>([]);
  const [zones, setZones] = useState<IZone[]>([]);
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [incidents, setIncidents] = useState<IIncident[]>([]);
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [simulator, setSimulator] = useState<ISimulatorStatus>(defaultSimulatorStatus);
  const [selectedVessel, setSelectedVessel] = useState<IVessel | null>(null);
  const [selectedZone, setSelectedZone] = useState<IZone | null>(null);
  const [latestNmea, setLatestNmea] = useState<string>('');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(audioService.getMutedState());
  const [activeIntrusionNotification, setActiveIntrusionNotification] = useState<{
    vessel: IVessel;
    alert: IAlert;
    zoneName: string;
  } | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      const [vesselsRes, zonesRes, alertsRes, incidentsRes, statsRes, simRes] = await Promise.all([
        api.get('/vessels'),
        api.get('/zones'),
        api.get('/alerts'),
        api.get('/incidents'),
        api.get('/dashboard/stats'),
        api.get('/simulator/status')
      ]);

      setVessels(vesselsRes.data.data || []);
      setZones(zonesRes.data.data || []);
      setAlerts(alertsRes.data.data || []);
      setIncidents(incidentsRes.data.data || []);
      setStats(statsRes.data.data || null);
      if (simRes.data.data) {
        setSimulator(simRes.data.data);
      }
    } catch (err) {
      console.error('[Monitoring] Failed to fetch initial data:', err);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    const socket = socketService.getSocket();

    // Real-time event listeners
    socket.on('vessel:location_updated', (data: { vessel: IVessel; rawNmea?: string }) => {
      setVessels((prev) => {
        const index = prev.findIndex((v) => v.id === data.vessel.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = data.vessel;
          return updated;
        }
        return [...prev, data.vessel];
      });

      if (data.rawNmea) {
        setLatestNmea(data.rawNmea);
      }

      // Update selected vessel if currently viewed
      setSelectedVessel((curr) => (curr && curr.id === data.vessel.id ? data.vessel : curr));
    });

    socket.on('vessel:status_changed', (data: { vesselId: string; currentStatus: IVessel['status'] }) => {
      setVessels((prev) =>
        prev.map((v) => (v.id === data.vesselId ? { ...v, status: data.currentStatus } : v))
      );
    });

    socket.on('zone:approach', (data: { vessel: IVessel; alert: IAlert }) => {
      audioService.playWarningBeep();
      setAlerts((prev) => {
        if (prev.some((a) => a.id === data.alert.id)) return prev;
        return [data.alert, ...prev];
      });
    });

    socket.on('intrusion:detected', (data: { vessel: IVessel; alert: IAlert; incident?: IIncident; zone?: any }) => {
      audioService.playCriticalAlarm();
      setActiveIntrusionNotification({
        vessel: data.vessel,
        alert: data.alert,
        zoneName: data.zone?.zoneName || 'Offshore Restricted Zone'
      });

      setAlerts((prev) => {
        if (prev.some((a) => a.id === data.alert.id)) return prev;
        return [data.alert, ...prev];
      });

      if (data.incident) {
        setIncidents((prev) => {
          if (prev.some((i) => i.id === data.incident?.id)) return prev;
          return [data.incident!, ...prev];
        });
      }
    });

    socket.on('alert:created', (alert: IAlert) => {
      setAlerts((prev) => {
        if (prev.some((a) => a.id === alert.id)) return prev;
        return [alert, ...prev];
      });
    });

    socket.on('alert:acknowledged', (alert: IAlert) => {
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? alert : a)));
    });

    socket.on('alert:resolved', (alert: IAlert) => {
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? alert : a)));
    });

    socket.on('incident:created', (incident: IIncident) => {
      setIncidents((prev) => {
        if (prev.some((i) => i.id === incident.id)) return prev;
        return [incident, ...prev];
      });
    });

    socket.on('incident:updated', (incident: IIncident) => {
      setIncidents((prev) => prev.map((i) => (i.id === incident.id ? incident : i)));
    });

    socket.on('simulator:status', (status: ISimulatorStatus) => {
      setSimulator(status);
    });

    socket.on('simulator:reset', () => {
      fetchInitialData();
    });

    // Refresh KPIs every 5s
    const statsInterval = setInterval(async () => {
      try {
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data.data);
      } catch (e) {
        // ignore
      }
    }, 5000);

    return () => {
      clearInterval(statsInterval);
      socket.off('vessel:location_updated');
      socket.off('vessel:status_changed');
      socket.off('zone:approach');
      socket.off('intrusion:detected');
      socket.off('alert:created');
      socket.off('alert:acknowledged');
      socket.off('alert:resolved');
      socket.off('incident:created');
      socket.off('incident:updated');
      socket.off('simulator:status');
      socket.off('simulator:reset');
    };
  }, [fetchInitialData]);

  const selectVessel = (vessel: IVessel | null) => {
    setSelectedVessel(vessel);
  };

  const selectZone = (zone: IZone | null) => {
    setSelectedZone(zone);
  };

  const dismissIntrusionNotification = () => {
    setActiveIntrusionNotification(null);
  };

  const toggleAudioMute = () => {
    const newState = audioService.toggleMute();
    setIsAudioMuted(newState);
  };

  const startSimulation = async (scenario: SimulationScenario = 'intrusion_demo', speed: number = 1) => {
    try {
      const res = await api.post('/simulator/start', { scenario, speedMultiplier: speed });
      setSimulator(res.data.data);
    } catch (err) {
      console.error('[Simulator] Failed to start:', err);
    }
  };

  const pauseSimulation = async () => {
    try {
      const res = await api.post('/simulator/pause');
      setSimulator(res.data.data);
    } catch (err) {
      console.error('[Simulator] Failed to pause:', err);
    }
  };

  const resumeSimulation = async () => {
    try {
      const res = await api.post('/simulator/resume');
      setSimulator(res.data.data);
    } catch (err) {
      console.error('[Simulator] Failed to resume:', err);
    }
  };

  const stopSimulation = async () => {
    try {
      const res = await api.post('/simulator/stop');
      setSimulator(res.data.data);
    } catch (err) {
      console.error('[Simulator] Failed to stop:', err);
    }
  };

  const resetSimulation = async () => {
    try {
      const res = await api.post('/simulator/reset');
      setSimulator(res.data.data);
      setActiveIntrusionNotification(null);
      await fetchInitialData();
    } catch (err) {
      console.error('[Simulator] Failed to reset:', err);
    }
  };

  const setSimulationSpeed = async (speed: number) => {
    try {
      const res = await api.post('/simulator/speed', { speedMultiplier: speed });
      setSimulator(res.data.data);
    } catch (err) {
      console.error('[Simulator] Failed to set speed:', err);
    }
  };

  const acknowledgeAlert = async (id: string) => {
    try {
      const res = await api.put(`/alerts/${id}/acknowledge`);
      setAlerts((prev) => prev.map((a) => (a.id === id ? res.data.data : a)));
    } catch (err) {
      console.error('[Alert] Failed to acknowledge:', err);
    }
  };

  const resolveAlert = async (id: string) => {
    try {
      const res = await api.put(`/alerts/${id}/resolve`);
      setAlerts((prev) => prev.map((a) => (a.id === id ? res.data.data : a)));
    } catch (err) {
      console.error('[Alert] Failed to resolve:', err);
    }
  };

  const updateIncidentStatus = async (id: string, status: string, notes?: string) => {
    try {
      const res = await api.put(`/incidents/${id}`, { status, notes });
      setIncidents((prev) => prev.map((i) => (i.id === id ? res.data.data : i)));
    } catch (err) {
      console.error('[Incident] Failed to update:', err);
    }
  };

  return (
    <MonitoringContext.Provider
      value={{
        vessels,
        zones,
        alerts,
        incidents,
        stats,
        simulator,
        selectedVessel,
        selectedZone,
        latestNmea,
        isAudioMuted,
        activeIntrusionNotification,
        selectVessel,
        selectZone,
        dismissIntrusionNotification,
        toggleAudioMute,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        stopSimulation,
        resetSimulation,
        setSimulationSpeed,
        acknowledgeAlert,
        resolveAlert,
        updateIncidentStatus,
        refreshAll: fetchInitialData
      }}
    >
      {children}
    </MonitoringContext.Provider>
  );
};

export const useMonitoring = (): MonitoringContextType => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};
