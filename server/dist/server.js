"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify = (0, fastify_1.default)({ logger: true });
const PORT = parseInt(process.env.PORT || '3001');
// Register CORS
fastify.register(cors_1.default, {
    origin: '*', // Allow all origins for now (dev)
});
fastify.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return { hello: 'world', service: 'One2One Signaling Server', status: 'running' };
}));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fastify.ready();
        // Attach Socket.IO to the Fastify server instance
        const io = new socket_io_1.Server(fastify.server, {
            cors: {
                origin: '*', // Allow all origins for socket.io
                methods: ['GET', 'POST'],
            },
        });
        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);
            socket.on('join-room', (roomId, userId) => {
                console.log(`User ${userId} joined room ${roomId}`);
                socket.join(roomId);
                socket.to(roomId).emit('user-connected', userId);
                socket.on('disconnect', () => {
                    console.log(`User ${userId} disconnected`);
                    socket.to(roomId).emit('user-disconnected', userId);
                });
            });
            // Signaling events
            socket.on('offer', (data) => {
                socket.to(data.roomId).emit('offer', data);
            });
            socket.on('answer', (data) => {
                socket.to(data.roomId).emit('answer', data);
            });
            socket.on('ice-candidate', (data) => {
                socket.to(data.roomId).emit('ice-candidate', data);
            });
        });
        // Run the server!
        yield fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server listening on http://localhost:${PORT}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});
start();
