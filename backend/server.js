const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require("cors");
const mongoose = require('mongoose');

app.use(cors());

console.log('Server starting...');

// MongoDB connection
const mongoDB = 'mongodb+srv://sepreck:agadir@cluster0.r24dbox.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB URI
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a schema for chat messages
const Schema = mongoose.Schema;
const chatSchema = new Schema({
    message: String,
    timestamp: { type: Date, default: Date.now }
});

// Create a model based on the schema
const ChatMessage = mongoose.model('ChatMessage', chatSchema);

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

io.on('connection', (socket) => {
    console.log(`${new Date().toISOString()} - A user connected: Socket ID = ${socket.id}`);

    socket.on('chat message', (msg) => {
        console.log('Received message:', msg);

        // Save message to MongoDB
        const chatMessage = new ChatMessage({ message: msg });
        chatMessage.save().then(() => console.log('Message saved to database'));

        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log(`${new Date().toISOString()} - A user disconnected: Socket ID = ${socket.id}`);
    });
});
