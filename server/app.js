// server/app.js
require("dotenv").config();
require("express-async-errors");


const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./db/connect");
const mainRouter = require("./routes/index");
const { socketConnection } = require ("./sockets/chat");
const app = express();

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,   // e.g. http://localhost:5173
  process.env.VERCEL_ORIGIN,   // e.g. https://chat-26cp.vercel.app
].filter(Boolean);
// --- EXPRESS SETUP ---
app.use(express.json());
// Only allow your Vite origin

// strictly only allow your client origin
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET","POST"],
  credentials: true
}));
app.use("/api/v1", mainRouter);

// make an http.Server out of express app:
const server = http.createServer(app);

// attach socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

socketConnection(io);
// io.on("connection", (socket) => {
//   console.log("🟢WebSocket connected:", socket.id);

//   socket.on("joinGeneral", () => {
//     socket.join("general");
//     console.log(`${socket.id} joined general chat`);
//   });

//   socket.on("chatMessage", payload => {
//     console.log(`↪ chatMessage from ${socket.id}:`, payload);
//     io.to("general").emit("chatMessage", payload);
//   });

//   socket.on("disconnect", () => {
//     console.log("🔴 WebSocket disconnected:", socket.id);
//   });
// });

const PORT = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(PORT, () => {
      console.log(`Server + WS listening on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
};
start();
