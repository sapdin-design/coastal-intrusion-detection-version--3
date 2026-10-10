import { Server as SocketIOServer, Socket } from 'socket.io';
import { SimulatorService } from '../services/simulator.service';
import { IntrusionService } from '../services/intrusion.service';
import { AlertService } from '../services/alert.service';
import { IncidentService } from '../services/incident.service';

export function setupSocketIO(io: SocketIOServer): void {
  // Pass IO instance to all services
  IntrusionService.setSocketIO(io);
  SimulatorService.setSocketIO(io);
  AlertService.setSocketIO(io);
  IncidentService.setSocketIO(io);

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Send immediate simulator status on connect
    socket.emit('simulator:status', SimulatorService.getStatus());

    socket.on('simulator:start', async (data: { scenario?: any; speedMultiplier?: number }) => {
      console.log(`[Socket.IO] Received simulator:start from ${socket.id}`, data);
      const status = await SimulatorService.start(data?.scenario, data?.speedMultiplier);
      io.emit('simulator:status', status);
    });

    socket.on('simulator:pause', () => {
      const status = SimulatorService.pause();
      io.emit('simulator:status', status);
    });

    socket.on('simulator:resume', () => {
      const status = SimulatorService.resume();
      io.emit('simulator:status', status);
    });

    socket.on('simulator:stop', () => {
      const status = SimulatorService.stop();
      io.emit('simulator:status', status);
    });

    socket.on('simulator:reset', () => {
      const status = SimulatorService.reset();
      io.emit('simulator:status', status);
    });

    socket.on('simulator:speed', (data: { speedMultiplier: number }) => {
      const status = SimulatorService.setSpeed(data.speedMultiplier);
      io.emit('simulator:status', status);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}
