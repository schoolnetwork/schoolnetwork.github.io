const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let messages = [];  // Store messages here

app.use(express.static('public'));  // Serve static files

// Serve the chat page
app.get('/chat.html', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
});

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // Send all previous messages to the newly connected client
    socket.emit('load messages', messages);

    // Listen for incoming messages
    socket.on('chat message', (msgData) => {
        // Generate a unique ID for each message
        const messageId = socket.id + '-' + Date.now();

        // Store the message with the ID
        const message = {
            id: messageId,
            user: msgData.user,
            msg: msgData.msg,
        };
        messages.push(message);

        // Broadcast the message to all clients
        io.emit('chat message', message);
    });

    // Listen for owner requesting message deletion
    socket.on('delete message', (messageId, password) => {
        if (password === 'owneriscool') {
            // Delete the message from the array
            messages = messages.filter(msg => msg.id !== messageId);

            // Broadcast the delete event to all clients
            io.emit('delete message', messageId);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
