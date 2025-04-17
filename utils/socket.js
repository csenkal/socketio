import { Server } from "socket.io";

let io;

export function initializeSocket(server) {
    io = new Server(server.server);
    return io;
}

export function getSocketIO() {
    if (!io) {
        throw new Error("Socket.io is not initialized!");
    }
    return io;
}