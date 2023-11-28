import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, AppState } from 'react-native';
import io from 'socket.io-client';

console.log('Initializing client...'); // Log client initialization
const socket = io("http://192.168.0.91:3000");

const Chat = () => {
    console.log('Setting up Chat component'); // Log setup of Chat component
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        console.log('Setting up socket event listeners'); // Log setup of socket listeners
        
        socket.on('connect', () => {
            console.log('Connected to server'); // Log successful connection
        });

        socket.on('chat message', (msg) => {
            console.log('Received message:', msg); // Log received messages
            setMessages(prevMessages => [...prevMessages, msg]);
        });

        const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            console.log('Cleaning up event listeners'); // Log cleanup
            socket.off('chat message');
            appStateSubscription.remove();
        };
    }, []);

    const handleAppStateChange = (nextAppState) => {
        console.log('App state changed to:', nextAppState); // Log app state changes
        if (nextAppState === 'active') {
            console.log('App is in foreground');
        } else {
            console.log('App is in background');
        }
    };

    const sendMessage = () => {
        if (message.trim().length > 0) {
            console.log('Sending message:', message); // Log message sending
            socket.emit('chat message', message);
            setMessages(prevMessages => [...prevMessages, message]);
            setMessage('');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
