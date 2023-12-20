import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import io from 'socket.io-client';

// Initialize the Socket.IO client
const socket = io("http://192.168.110.63:3000");

const Chat = () => {
    const [message, setMessage] = useState(''); // State for the current message
    const [messages, setMessages] = useState([]); // State for storing chat messages

    useEffect(() => {
        // Setting up socket event listeners
        socket.on('chat message', (msg) => {
            setMessages(prevMessages => [...prevMessages, msg]);
        });

        return () => {
            // Clean up event listeners
            socket.off('chat message');
        };
    }, []);

   
    // Send a chat message
    const sendMessage = () => {
        if (message.trim().length > 0) {
            socket.emit('chat message', message); // Send message to server
            setMessage('');
        }
    };

   
   
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* List of chat messages */}
            
            
            
            <FlatList
                data={messages}
                renderItem={({ item }) => (
                  
                  
                  <Text style={{ padding: 10, borderWidth: 1, margin: 2 }}>
                        {item}
                    </Text>
               
               
               
               )}
                keyExtractor={(item, index) => index.toString()}
            />

            
            
            
            {/* UI for sending messages */}
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, width: '80%' }}
                value={message}
                onChangeText={setMessage}
            />
            
            
            <Button onPress={sendMessage} title="Send Message" />
        </View>
    );
};

export default Chat;
