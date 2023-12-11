import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, AppState } from 'react-native';
import io from 'socket.io-client';

console.log('Initializing client...');
const socket = io("http://192.168.22.241:3000");

const Chat = () => {
    console.log('Setting up Chat component');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [room, setRoom] = useState('');

    useEffect(() => {
        console.log('Setting up socket event listeners');
        
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('chat message', (msg) => {
            console.log('Received message:', msg);
            setMessages(prevMessages => [...prevMessages, msg]);
        });

        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            console.log('Cleaning up event listeners');
            socket.off('chat message');
            appStateSubscription.remove();
        };
    }, []);

    const handleAppStateChange = (nextAppState) => {
        console.log('App state changed to:', nextAppState);
        if (nextAppState === 'active') {
            console.log('App is in foreground');
        } else {
            console.log('App is in background');
        }
    };

    const joinRoom = () => {
        socket.emit('join room', room);
    };

    const leaveRoom = () => {
        socket.emit('leave room', room);
    };

    const sendMessage = () => {
        if (message.trim().length > 0) {
            console.log('Sending message:', message);
            socket.emit('chat message', message, room);
            setMessage('');
        }
    };

    const fetchRoomMessages = async () => {
        try {
            const response = await fetch(`http://192.168.0.181:3000/room-messages/${room}`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching room messages:', error);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            
            {/* Room join/leave functionality */}
            <TextInput
                value={room}
                onChangeText={setRoom}
                placeholder="Enter Room Name"
            />
            <Button onPress={joinRoom} title="Join Room" />
            <Button onPress={leaveRoom} title="Leave Room" />
            
            {/* Button to fetch room messages */}
            <Button onPress={fetchRoomMessages} title="Load Room Messages" />
            
            <FlatList
                data={messages}
                renderItem={({ item }) => (
                    <Text style={{ padding: 10, borderWidth: 1, margin: 2 }}>
                        {item}
                    </Text>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: '80%' }}
                value={message}
                onChangeText={setMessage}
            />
            <Button
                onPress={sendMessage}
                title="Send Message"
            />
        </View>
    );
};

export default Chat;
