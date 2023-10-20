'use strict';

require('dotenv').config();
const express = require('express');
const { Server } = require('socket.io');
const ChatService = require('./src/services/chat.service');
const PresenceService = require('./src/services/presence.service');

const app = express();
const server = require('http').createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }
});

// Run chat service
new ChatService(io);
new PresenceService(io);

io.on('connection', (socket) => {
  console.log(`A user with ${socket.id} connected to main service`);

  socket.on('disconnect', () => {
    console.log(`A user with ${socket.id} disconnected from main service`);
  });
});

// init db
require('./src/database/init.mongodb');

const PORT = process.env.PORT || 4056;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
