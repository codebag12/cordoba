const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const redis = require('redis');
const cors = require("cors");

app.use(cors());
console.log('Server starting...');

// Replace with your Redis server address
const redisClient = redis.createClient({ 
    host: 'localhost', 
    port: 6379
});

redisClient.on("error", (err) => {
    console.error("Error connecting to Redis", err);
});

// Function to set a message in Redis
async function setRedisCache(key, value, expiryTime = 21600) {
    return new Promise((resolve, reject) => {
        redisClient.set(key, JSON.stringify(value), 'EX', expiryTime, (error, reply) => {
            if (error) {
                console.error("Redis set error:", error);
                return reject(error);
            }
            resolve(reply);
        });
    });
}

// Function to get a message from Redis
async function getRedisCache(key) {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (error, value) => {
            if (error) {
                console.error("Redis get error:", error);
                return reject(error);
            }
            resolve(JSON.parse(value));
        });
    });
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

io.on('connection', (socket) => {
    console.log(`${new Date().toISOString()} - A user connected: Socket ID = ${socket.id}`);

    socket.on('join room', async (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
        // Retrieve and send past messages for the room
        // This part needs to be adapted based on how you choose to implement message retrieval
    });

    socket.on('chat message', async (msg, room) => {
        console.log('Received message:', msg);
        const messageKey = `message:${room}:${new Date().getTime()}`;
        try {
            await setRedisCache(messageKey, msg); // Storing each message with a unique key
            io.to(room).emit('chat message', msg);
        } catch (error) {
            console.error('Error setting message in Redis:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`${new Date().toISOString()} - A user disconnected: Socket ID = ${socket.id}`);
    });

    socket.on('leave room', (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left room ${room}`);
    });
});

redisClient.on('connect', () => {
    console.log('Connected to Redis server');
});
