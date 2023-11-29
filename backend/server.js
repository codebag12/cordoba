const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require("cors");
app.use(cors());

console.log('Server starting...'); // Log when the server starts

app.get('/', (req, res) => {
    res.send('Hello World!');
}) 

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});



io.on('connection', (socket) => {
    
    console.log(`${new Date().toISOString()} - A user connected: Socket ID = ${socket.id}`);
    
    // Join a room
    socket.on('join room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    // Leave a room
    socket.on('leave room', (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left room ${room}`);
    });


    socket.on('chat message', (msg,room) => {
        console.log('Received message:', msg); // Log received messages
        if(room){
        io.to(room).emit('chat message', msg); // Broadcast the message to all users
  }
  else{
    socket.broadcast.emit('chat message', msg); // Broadcast to all but sender

  }
    });

    socket.on('disconnect', () => {
        console.log(`${new Date().toISOString()} - A user disconnected: Socket ID = ${socket.id}`);
    });

    socket.on('connect_error', (error) => {
        console.log('Connection Error:', error);
     });
     
     socket.on('connect_timeout', (timeout) => {
        console.log('Connection Timeout:', timeout);
     });
     
});

