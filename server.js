const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const rateLimit = require("express-rate-limit");

const app = express();
const apiRouter = require("./routes/apiRoutes");
const gameRouter = require("./routes/gameRoutes");

app.use(cors());

app.use(express.json());
app.set('trust proxy', true);

const limiter = rateLimit({
  windowMs: 60_000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);
app.use("/kickstart", limiter);

app.use("/api", apiRouter);
app.use("/data", gameRouter);

app.get("/", (req, res) => {
  res.send("hi! idk why ur here but this is the backend for sfools");
});

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const sockets = require("./sockets/sockets");
sockets(io);

server.listen(5000, () => {
  console.log("server is running on 5000");
});
