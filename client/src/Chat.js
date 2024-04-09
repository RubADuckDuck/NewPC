// client/src/Chat.js
import React, { useState, useEffect, useRef } from 'react';

function Chat() {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:3001');
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'users') {
                setUsers(data.data);
            } else if (data.type === 'chat') {
                const sender = data.fromUserId ? `User ${data.fromUserId}: ` : 'You: ';
                setMessages(prevMessages => [...prevMessages, `${sender}${data.data}`]);
            }
        };
        return () => ws.current.close();
    }, []);

    const sendMessage = () => {
        if (ws.current) {
            const messageType = selectedUserId ? 'private' : 'chat';
            ws.current.send(JSON.stringify({ type: messageType, data: userInput, toUserId: selectedUserId }));
            setUserInput('');
            setSelectedUserId(null);
        }
    };

    return (
        <div>
            <h2>Connected Usersss</h2>
            <ul>
                {users.map(userId => (
                    <li key={userId} onClick={() => setSelectedUserId(userId)}>
                        User {userId}
                    </li>
                ))}
            </ul>
            <div>
                {messages.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>
            <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type a message here..."></textarea><br />
            <button onClick={sendMessage}>Send Message</button>
        </div>
    );
}

export default Chat;
