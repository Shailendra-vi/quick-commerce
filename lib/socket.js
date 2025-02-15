import { Server } from "socket.io";

let io;

export function initializeSocket(httpServer) {
  if (!io) {
    io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      socket.on("joinRoom", (userId) => {
        socket.join(userId);
        console.log(`User joined room: ${userId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    global.io = io;
  }
  return io;
}

export function getIo() {
  if (!global.io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return global.io;
}
