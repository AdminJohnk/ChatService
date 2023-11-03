'use strict';

require('dotenv').config();
const express = require('express');
const { Server } = require('socket.io');
const ChatService = require('./src/services/chat.service');
const PresenceService = require('./src/services/presence.service');

const app = express();
app.get('/', (_, res) => {
  res.send('Hello World!');
});
const server = require('http').createServer(app);

const io = new Server(server, { cors: { origin: '*' }, pingTimeout: 60000 });

// Run chat service
new ChatService(io);
new PresenceService(io);

// init db
require('./src/database/init.mongodb');

const PORT = process.env.PORT || 4056;
io.on('connection', (socket) => {
  // get room
  const room = io.sockets.adapter.rooms.get('room');
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
