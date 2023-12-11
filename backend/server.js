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
    port: 6379,
    retry_strategy: function(options) {
        console.log('Redis retry strategy activated'); // Added: Logging for retry strategy
        if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Redis server refused the connection'); // Added: Logging the specific error
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            console.error('Retry time for Redis connection exhausted'); // Added: Logging for retry timeout
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            console.error('Max retries for Redis connection exceeded'); // Added: Logging for max retries exceeded
            return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
    }
});

redisClient.on("error", (err) => {
    console.error("Error connecting to Redis", err);
});

redisClient.on('end', () => {
    console.log('Redis client disconnected'); // Added more logging
    // Handle disconnection if necessary
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

app.get('/room-messages/:room', async (req, res) => {
    try {
        let roomMessages = [];
        redisClient.keys(`message:${req.params.room}:*`, async (err, keys) => {
            if (err) return res.status(500).send(err.message);

            for (let key of keys) {
                try {
                    const message = await getRedisCache(key);
                    roomMessages.push(message);
                } catch (getErr) {
                    console.error('Error getting message from Redis:', getErr); // Added error handling for getRedisCache
                }
            }

            res.json(roomMessages);
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

io.on('connection', (socket) => {
    console.log(`${new Date().toISOString()} - A user connected: Socket ID = ${socket.id}`);

    socket.on('join room', async (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
    });

    socket.on('chat message', async (msg, room) => {
        console.log('Received message:', msg);
        const messageKey = `message:${room}:${new Date().getTime()}`;
        try {
            await setRedisCache(messageKey, msg);
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
