const validator = require('validator');
const formatMessage = require('../utils/messages');

const { userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    isUsernameOnline,
} = require('../utils/users');

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
      if (typeof username !== "string" || typeof room !== "string") {
        socket.emit("errorMessage", "username and room must be strings.");
        return socket.disconnect();
      }

      const cleanUsername = validator.trim(username).slice(0, 20);
      const cleanRoom = validator.trim(room).slice(0, 50);

      if (!/^[a-zA-Z0-9_ ]+$/.test(cleanUsername)) {
        socket.emit("errorMessage", "Invalid username.");
        return socket.disconnect();
      }

      if (isUsernameOnline(cleanUsername)) {
        socket.emit("errorMessage", "this username is already online.");
        return socket.disconnect();
      }

      const user = userJoin(socket.id, cleanUsername, cleanRoom);
      if (!user) {
        socket.emit("errorMessage", "Unable to join room.");
        return socket.disconnect();
      }

      socket.join(cleanRoom);

      socket.emit(
        "global",
        formatMessage("SYSTEM", `Hi ${cleanUsername} welcome!`)
      );
      socket.broadcast
        .to(cleanRoom)
        .emit(
          "global",
          formatMessage("SYSTEM", `${cleanUsername} has joined the chat!`)
        );

      io.to(cleanRoom).emit("roomUsers", {
        room: cleanRoom,
        users: getRoomUsers(cleanRoom),
      });
    });

    const RATE = { refillMs: 1000, refill: 1, burst: 5 };
    const buckets = new Map();

    const checkRate = (id) => {
      const now = Date.now();
      const b = buckets.get(id) || { tokens: RATE.burst, last: now };
      const gained = Math.floor((now - b.last) / RATE.refillMs) * RATE.refill;
      b.tokens = Math.min(RATE.burst, b.tokens + gained);
      b.last = now;
      if (b.tokens <= 0) {
        buckets.set(id, b);
        return false;
      }
      b.tokens -= 1;
      buckets.set(id, b);
      return true;
    };

    socket.on("chatMessage", (msg) => {
      const user = getCurrentUser(socket.id);
      if (
        !user ||
        typeof user.username !== "string" ||
        typeof user.room !== "string"
      )
        return;
      if (!checkRate(socket.id)) return;

      let cleanMsg = "";
      if (typeof msg === "string") cleanMsg = msg.slice(0, 1000);

      io.to(user.room).emit("message", formatMessage(user.username, cleanMsg));
    });

    socket.on("disconnect", () => {
      buckets.delete(socket.id);

      const user = userLeave(socket.id);
      if (
        !user ||
        typeof user.username !== "string" ||
        typeof user.room !== "string"
      )
        return;

      io.to(user.room).emit(
        "global",
        formatMessage("SYSTEM", `${user.username} has left the room!`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    });
  });
};
