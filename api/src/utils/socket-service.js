const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
      ].filter(Boolean),
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected to socket:", socket.id);

    // Instructor joins a private room based on their ID
    socket.on("join-instructor", (instructorId) => {
      socket.join(instructorId);
      console.log(`Instructor ${instructorId} joined room`);
    });

    // Student joins a private room based on their ID
    socket.on("join-student", (studentId) => {
      socket.join(studentId);
      console.log(`Student ${studentId} joined room`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Emit event to a specific instructor
const emitToInstructor = (instructorId, event, data) => {
  if (io) {
    io.to(instructorId).emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToInstructor };
