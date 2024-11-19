const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Set up the app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (your chat page)
app.use(express.static('public'));

// Keep track of messages and users
let messages = [];
let users = {};

// When a client connects to the WebSocket server
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send all messages to the new user
  socket.emit('load messages', messages);

  // Event to change username
  socket.on('change username', (username) => {
    users[socket.id] = username;
    console.log(`${socket.id} changed username to ${username}`);
  });

  // Event to receive chat message and broadcast to all clients
  socket.on('chat message', (msg) => {
    const username = users[socket.id] || 'Anonymous';
    const messageData = { user: username, msg: msg, id: socket.id };
    messages.push(messageData);
    io.emit('chat message', messageData);
  });

  // Event to delete a message (for the owner only)
  socket.on('delete message', (msgId, password) => {
    if (password === 'owneriscool') {
      // Only allow deletion for the owner
      messages = messages.filter((msg) => msg.id !== msgId);
      io.emit('load messages', messages); // Reload messages for all clients
      console.log(`Message with ID ${msgId} deleted by the owner`);
    } else {
      console.log('Incorrect password for deletion');
    }
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    delete users[socket.id];
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
