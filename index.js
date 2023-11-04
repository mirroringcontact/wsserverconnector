
'use strict';

const express = require('express');
const path = require('path');
const { createServer } = require('http');

const WebSocket = require('ws');
const secretTokens = new Map();

const app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.get('/token', (req, res) => {
    const token = req.query.token;
    const ip = req.query.port;
    const clientIP = req.ip;
    console.log("receive token: ", token, ", from client: ", clientIP, ", redirect to: ", ip);
    const client = findClientByToken(token);
    
    if (client) {
        foundClient.send(ip);
        console.log("send to client url for stream: ", ip);
    } else {
        console.log("client ws not found");
    }
    res.send('');
});

const server = createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', function (ws, req) {
    const clientAddress = req.socket.remoteAddress;
    console.log('client new:', clientAddress);
    
    ws.onmessage = function(event) {
        const token = event.data;
        secretTokens.set(ws, token);
        console.log('add token', token, ", client: ", clientAddress);
    };
    
    ws.on("close", () => {
        let success = secretTokens.delete(ws);
        console.log("disconnect client: ", clientAddress, "removed from storage: ", success);
    });
});

var port = 443;
server.listen(port, function () {
    console.log("Run");
});

function findClientByToken(text) {
    secretTokens.forEach((client, token) => {
        if (text === token) {
            return client
        }
    });
    return null;
}

