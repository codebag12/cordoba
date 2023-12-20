// Import the required modules
const express = require('express'); // Express framework for building web applications
const app = express(); // Create an instance of the Express application
const http = require('http').createServer(app); // Create an HTTP server using the Express app
const io = require('socket.io')(http); // Create a Socket.IO instance using the HTTP server
const cors = require("cors"); // Cross-origin resource sharing middleware

app.use(cors()); // Enable cross-origin requests

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
