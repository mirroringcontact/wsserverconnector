
'use strict';

const express = require('express');
const path = require('path');
const { createServer } = require('http');

const WebSocket = require('ws');
const secretTokens = new Map();

const app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.get('/token', (req, res) => {
    const token = req.query.token;
    const ip = req.query.port;
    const clientIP = req.ip;
    console.log("receive token: ", token, ", from client: ", clientIP, ", redirect to: ", ip);
    const client = findClientByToken(token);
    
    if (client) {
        foundClient.send(ip);
        console.log("send to client url for stream: ", ip);
        res.send('Ok');
    } else {
        console.log("client ws not found");
        return res.status(401).json({ error: 'Error 3' });
    }
});

app.post('/redirect', (req, res) => {
    const authToken = req.headers.authorization;
    
    if (!authToken) {
        return res.status(401).json({ error: 'Error 1' });
    }
    console.log("auth: ", authToken, "body: ", req.body);
    if (authToken === 'Bearer cThIIoDvwdueQB468K5xDc5633seEFoqwxjF_xSJyQQ') {
        const requestBody = req.body;
        if (requestBody.token) {
            const token = requestBody.token;
            const client = findClientByToken(token);
            if (client) {
                const redirectUrl = requestBody.url;
                client.send(redirectUrl);
                console.log("send to client url for stream: ", redirectUrl);
                res.json({ message: 'Ok' });
            } else {
                console.log("client ws not found");
                res.status(401).json({ error: 'Error 2' });
            }
        } else {
            res.status(401).json({ error: 'Error 3' });
        }
    } else {
        res.status(401).json({ error: 'Error 4' });
    }
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

