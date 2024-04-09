const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const port = process.env.PORT || 3001;

// Serve static files from the 'public' directory
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = {};

wss.on('connection', (ws) => {
    // Assign a unique ID to each user. For simplicity, use the current timestamp.
    const userId = Date.now().toString();
    users[userId] = ws;
    console.log(`User ${userId} connected`);

    // Broadcast updated user list to all connected clients
    sendConnectedUsers();

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        const parsedMessage = JSON.parse(message);

        // Handle different types of messages
        switch (parsedMessage.type) {
            case 'chat':
                // Broadcast message to all users
                broadcast(JSON.stringify({
                    type: 'chat',
                    data: parsedMessage.data,
                    fromUserId: userId
                }), userId);
                break;
            case 'private':
                // Send private message to specific user
                sendPrivateMessage(parsedMessage.data, userId, parsedMessage.toUserId);
                break;
            default:
                console.log('Unknown message type:', parsedMessage.type);
        }
    });

    ws.on('close', () => {
        console.log(`User ${userId} disconnected`);
        delete users[userId];
        // Broadcast updated user list to all connected clients
        sendConnectedUsers();
    });
});

function sendConnectedUsers() {
    const userIds = Object.keys(users);
    broadcast(JSON.stringify({ type: 'users', data: userIds }), null);
}

function broadcast(message, senderId) {
    Object.values(users).forEach(user => {
        if (user.readyState === WebSocket.OPEN) {
            user.send(message);
        }
    });
}

function sendPrivateMessage(message, fromUserId, toUserId) {
    const recipientSocket = users[toUserId];
    if (recipientSocket && recipientSocket.readyState === WebSocket.OPEN) {
        recipientSocket.send(JSON.stringify({
            type: 'chat',
            data: message,
            fromUserId: fromUserId
        }));
    } else {
        console.log(`User ${toUserId} not found or connection is closed.`);
    }
}

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
