const users = [];

const userJoin = (id, username, room) => {
  const user = { id, username, room };

  users.push(user);

  return user;
};

const userLeave = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getRoomUsers = (room) => {
  return users.filter((user) => user.room === room);
};

const getCurrentUser = (id) => {
  return users.find((user) => user.id === id);
};

const isUsernameOnline = (username) => {
  return users.some(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );
};

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  isUsernameOnline,
};
