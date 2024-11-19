const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Set up the app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (your chat page)
app.use(express.static('public'));

// When a client connects to the WebSocket server
io.on('connection', (socket) => {
  console.log('A user connected');

  // Broadcast incoming messages to all clients
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);  // send to all clients
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
