import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { ENV } from './config/env';
import { connectDatabase } from './config/database';
import { setupSocketIO } from './socket/socketHandler';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocketIO(io);

async function startServer() {
  await connectDatabase();

  server.listen(ENV.PORT, () => {
    console.log(`=============================================================`);
    console.log(` CIDRTM Coastal Intrusion Detection & Real-Time Monitoring `);
    console.log(` Sector: Kanyakumari Coast, Tamil Nadu, India               `);
    console.log(` Mode: SIMULATION MODE (₹0–₹1,000 Software Prototype)       `);
    console.log(` HTTP API Server: http://localhost:${ENV.PORT}              `);
    console.log(` WebSocket: ws://localhost:${ENV.PORT}                      `);
    console.log(`=============================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});

export { app, server, io };
