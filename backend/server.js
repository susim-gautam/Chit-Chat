const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
var cors = require("cors");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { Server } = require("socket.io");
const Chat = require("./models/chatModel");
const { createServer } = require("http");
// import {createServer} from "http";
const path = require("path");

const app = express();

// const server = createServer(app);

dotenv.config();

connectDB();

app.use(express.json()); //to accept json data

// Enable CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// app.get("/", (req, res) => {
//   res.send("API is running succesfully ");
// });

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------deployment

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  // app.use(express.static(path.join(__dirname1, "/frontend/build")));
  const buildPath = path.join(__dirname1, "/frontend/build");
  console.log(`Serving static files from: ${buildPath}`);
  app.use(express.static(buildPath));

  // console.log(`Incoming request: ${req.method} ${req.path}`);

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running succesfully ");
  });
}

// --------------deployment

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  5000,
  console.log(`server started on PORT ${PORT}`.yellow.bold)
);

// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`.yellow.bold);
// });

const getChatById = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate("users", "_id name email")
      .populate("latestMessage")
      .populate("groupAdmin", "_id name email");
    return chat;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    // origin: "*",
    // origin: "http://127.0.0.1:3000",
  },
});

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });

io.on("connection", (socket) => {
  console.log("connected to socket.io", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
    console.log("connected", socket.id);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(socket.id + "User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", async (newMessageRecieved) => {
    console.log("tocheckmessgae");
    console.log(newMessageRecieved);

    // var chat = newMessageRecieved.chat;

    const chatId = newMessageRecieved.chat;

    // Fetch the entire chat object from the database or cache
    const chat = await getChatById(chatId);
    console.log(chat);

    if (!chat || !chat.users) return console.log("chat.users not defined");

    // if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      // console.log(user._id);
      // console.log(newMessageRecieved.sender._id);
      // console.log(chat._id);
      if (user._id == newMessageRecieved.sender._id) return;

      // socket.to(chat._id).emit("message_recieved", newMessageRecieved);
      // console.log(socket.id);
      // socket.to(socket.id).emit("message_recieved", newMessageRecieved);
      // socket.in(chat._id).emit("message_recieved", newMessageRecieved);
      socket.broadcast.emit("message_recieved", newMessageRecieved);
      // socket.broadcast.to(chat._id).emit("message_recieved", newMessageRecieved);
      // socket.emit("message_recieved", newMessageRecieved);
      console.log("get in the if");
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
