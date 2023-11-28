const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

console.log('Server starting...'); // Log when the server starts

app.get('/', (req, res) => {
    res.send('Hello World!');
}) 

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        console.log('Received message:', msg); // Log received messages
        io.emit('chat message', msg); // Broadcast the message to all users
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on('connect_error', (error) => {
        console.log('Connection Error:', error);
     });
     
     socket.on('connect_timeout', (timeout) => {
        console.log('Connection Timeout:', timeout);
     });
     
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
