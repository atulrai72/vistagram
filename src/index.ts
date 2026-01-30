import express from "express";
import morgan from "morgan";
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import authRouter from "./routes/auth.router.js";
import postsRouter from "./routes/post.router.js";
import errorMiddleware from "./error-handler/index.js";
import userRouter from "./routes/user.router.js";
import * as schema from "./db/schema.js";
import commentRouter from "./routes/comment.router.js";
import likeRouter from "./routes/like.router.js";
import cors from "cors";
import searchRouter from "./routes/search.router.js";
import { Server } from "socket.io";
import { createServer } from "http";
import chatRouter from "./routes/chat.router.js";
import { connectKafka } from "./lib/kafka.js";

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

// Connect to the database
export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
  },
  schema: schema,
});

// TODO: After the chatting thing and signpout perfectly synced
// Check on the middleware if the user exists and also if both follow each other(Maybe)

// Open the websocket connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listening to the messages sending by the user to the certain room
  socket.on("message", (data) => {
    console.log("User message", data);
    console.log(data.room);
    io.to(data.room).emit("recieve_message", data);
  });

  // Join a new room or existing room
  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined the room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

app.get("/", (req, res) => {
  try {
    res.json({
      message: "Server Running",
    });
  } catch (error) {
    console.error("Something went wrong!");
    res.json({
      message: "Something went very wrong",
    });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", userRouter);
app.use("/api/comments", commentRouter);
app.use("/api/likes", likeRouter);
app.use("/api/search", searchRouter);
app.use("/api/chat", chatRouter);

app.use(errorMiddleware);

const PORT = 3001;

const start = async () => {
  await connectKafka();

  httpServer.listen(PORT, () => {
    console.log(`Server is listen on port ${PORT}`);
  });
};

start();
