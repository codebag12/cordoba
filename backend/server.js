const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const redis = require('redis');
const cors = require("cors");
app.use(cors());

console.log('Server starting...'); // Log when the server starts

app.get('/', (req, res) => {
    res.send('Hello World!');
}) 

// Create a new Redis client. The default port for Redis is 6379.
const redisClient = redis.createClient({ 
    host: 'localhost:6379', // Replace with your Redis server address
    port: 6379
  });
  
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
        const roomKey = `messages:${room}`;
        
        redisClient.lpush(roomKey, JSON.stringify({ msg, timestamp: new Date() }), (err) => {
           
            if (err) {
                console.error('Redis LPUSH Error:', err);
                return; // Exit if there is an error
            }

        }); 
       
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


     // New event for joining a room
socket.on('join room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  
    // Fetch last 50 messages from Redis
    const roomKey = `messages:${room}`;
    redisClient.lrange(roomKey, 0, 49, (err, messages) => {
      if (err) {
        console.error('Redis LRANGE Error:', err);
        return;
      }
  
      // Emit past messages to the user
      const parsedMessages = messages.map(JSON.parse);
      socket.emit('past messages', parsedMessages.reverse());
    });
  });
  
     
});

// Log connection status
redisClient.on('connect', () => {
    console.log('Connected to Redis server');
  });

  redisClient.on('error', (err) => {
    console.log('Redis error: ', err);
  });