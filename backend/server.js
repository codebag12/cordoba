const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require("cors");

app.use(cors()); // Allow cross-origin requests

console.log('Server starting...');

// Define the port for the server
const PORT = process.env.PORT || 3000;

// Start the server
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Handle new socket connections
io.on('connection', (socket) => {
    console.log(`${new Date().toISOString()} - A user connected: Socket ID = ${socket.id}`);

    // Handle incoming chat messages and broadcast them to all connected clients
    socket.on('chat message', (msg) => {
        console.log('Received message:', msg);
        io.emit('chat message', msg); // Broadcast message to all clients
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`${new Date().toISOString()} - A user disconnected: Socket ID = ${socket.id}`);
    });
});
