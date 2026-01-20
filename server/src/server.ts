import Fastify from 'fastify';
import { Server } from 'socket.io';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

const PORT = parseInt(process.env.PORT || '3001');

// Register CORS
fastify.register(cors, {
    origin: '*', // Allow all origins for now (dev)
});

fastify.get('/', async (request, reply) => {
    return { hello: 'world', service: 'One2One Signaling Server', status: 'running' };
});

const start = async () => {
    try {
        await fastify.ready();

        // Attach Socket.IO to the Fastify server instance
        const io = new Server(fastify.server, {
            cors: {
                origin: '*', // Allow all origins for socket.io
                methods: ['GET', 'POST'],
            },
        });

        // Track active rooms (for validation)
        const activeRooms = new Set();

        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('join-room', (roomId, userId) => {
                const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
                console.log(`User ${userId} joining room ${roomId}. Current size: ${roomSize}`);

                socket.join(roomId);
                socket.to(roomId).emit('user-connected', userId);

                socket.on('disconnect', () => {
                    console.log(`User ${userId} disconnected from ${roomId}`);
                    socket.to(roomId).emit('user-disconnected', userId);
                });
            });

            // New event for checking validity before joining
            socket.on('check-room', (roomId, callback) => {
                const room = io.sockets.adapter.rooms.get(roomId);
                const exists = room && room.size > 0;
                console.log(`Check room request for ${roomId}: Exists? ${exists}`);
                callback({ exists: !!exists });
            });

            // Signaling events - with logging
            socket.on('offer', (data) => {
                console.log(`[Signal] Offer from ${socket.id} to room ${data.roomId}`);
                socket.to(data.roomId).emit('offer', data);
            });

            socket.on('answer', (data) => {
                console.log(`[Signal] Answer from ${socket.id} to room ${data.roomId}`);
                socket.to(data.roomId).emit('answer', data);
            });

            socket.on('ice-candidate', (data) => {
                // console.log(`[Signal] ICE from ${socket.id}`);
                socket.to(data.roomId).emit('ice-candidate', data);
            });
        });

        // Run the server!
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server listening on http://localhost:${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
