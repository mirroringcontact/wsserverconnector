
'use strict';

const express = require('express');
const path = require('path');
const { createServer } = require('http');

const WebSocket = require('ws');
const secretTokens = new Map();

const app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());

app.post('/redirect', (req, res) => {
    const authToken = req.headers.authorization;
    
    if (!authToken) {
        return res.status(401).json({ error: 'Error 1' });
    }
    
    if (authToken !== 'cThIIoDvwdueQB468K5xDc5633seEFoqwxjF_xSJyQQ') {
        return res.status(401).json({ error: 'Error 2' });
    }
    
    const requestBody = req.body;
    
    const qrcode = requestBody.qrcode;
    if (!qrcode) {
        return res.status(401).json({ error: 'Error 3' });
    }
    
    const redirectUrl = requestBody.url;
    if (!redirectUrl) {
        return res.status(401).json({ error: 'Error 4' });
    }
    
    const client = findClientByToken(qrcode);
    if (!client) {
        logMessage("client ws not found for code: " + qrcode);
        return res.status(401).json({ error: 'Error 5' });
    }
    
    client.send(redirectUrl);
    logMessage("send to client url for stream: " + redirectUrl);
    res.json({ message: 'Ok' });
});

const server = createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', function (ws, req) {
    const clientAddress = req.socket.remoteAddress;
    logMessage('client new: ' + clientAddress);
    
    ws.onmessage = function(event) {
        const token = event.data;
        secretTokens.set(ws, token);
        logMessage('add token' + token + ", client: " + clientAddress);
    };
    
    ws.on("close", () => {
        let success = secretTokens.delete(ws);
        logMessage("disconnect client: " + clientAddress + "removed from storage: " + success);
    });
});

var port = 443;
server.listen(port, function () {
    logMessage("Run");
});

function findClientByToken(text) {
    for (const [client, token] of secretTokens.entries()) {
        if (text === token) {
            return client;
        }
    }
    return null;
}

function logMessage(message) {
    console.log(message);
}
