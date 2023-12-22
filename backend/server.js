const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require("cors");
const mongoose = require('mongoose');
const express = require('express'); // Importing Express module
const http = require('http').createServer(app); // Creating an HTTP server using Express
const io = require('socket.io')(http); // Creating a WebSocket server using Socket.IO
const cors = require("cors"); // Importing CORS module for cross-origin resource sharing
const mongoose = require('mongoose'); // Importing Mongoose module for MongoDB integration

// Importing required modules
const app = express(); // Creating an instance of Express
// Middleware setup
app.use(cors()); // Enabling CORS for all routes

console.log('Server starting...');

// MongoDB connection
const mongoDB = 'mongodb+srv://sepreck:agadir@cluster0.r24dbox.mongodb.net/chatApp?retryWrites=true&w=majority'; // Replace with your MongoDB URI
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }) // Connecting to MongoDB
    .then(() => console.log('MongoDB connected...')) // Logging successful connection
    .catch(err => console.error('MongoDB connection error:', err)); // Logging connection error, if any

// Define a schema for chat messages
const Schema = mongoose.Schema; // Creating a schema object
const chatSchema = new Schema({ // Defining the structure of the chat message schema
    message: String, // Message content
    timestamp: { type: Date, default: Date.now } // Timestamp of the message (default: current date and time)
});

// Create a model based on the schema
const ChatMessage = mongoose.model('ChatMessage', chatSchema, 'messages'); // Creating a model for chat messages

const PORT = process.env.PORT || 3000; // Setting the server port

http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`); // Logging the server start message
});

io.on('connection', (socket) => {
    console.log(`${new Date().toISOString()} - A user connected: Socket ID = ${socket.id}`); // Logging user connection event

    socket.on('chat message', (msg) => {
        console.log('Received message:', msg); // Logging received message

        // Save message to MongoDB
        const chatMessage = new ChatMessage({ message: msg }); // Creating a new chat message object
        chatMessage.save().then(() => console.log('Message saved to database')); // Saving the message to MongoDB

        io.emit('chat message', msg); // Emitting the message to all connected clients
    });

    socket.on('disconnect', () => {
        console.log(`${new Date().toISOString()} - A user disconnected: Socket ID = ${socket.id}`); // Logging user disconnection event
    });
};
});
