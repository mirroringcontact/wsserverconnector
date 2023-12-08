
'use strict';
const express = require('express');
const path = require('path');
const { createServer } = require('http');
const secretTokens = new Map();
//const unauthorizedClients = new Set();

const app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());

app.post('/redirect', (req, res) => {
    const authToken = req.headers.authorization;
    
    if (!authToken || authToken !== 'cThIIoDvwdueQB468K5xDc5633seEFoqwxjF_xSJyQQ') {
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        //        unauthorizedClients.add(clientIP);
        console.log("Unauthorized client: ", clientIP);
        return res.status(401).json({ error: 'unauthorized' });
    }
    
    const requestBody = req.body;
    
    const codeString = requestBody.qrcode;
    if (!codeString) {
        return res.status(401).json({ error: 'Error 3' });
    }
    
    const client = findClientIdWithCode(codeString);
    if (!client) {
        logMessage("client not found for code: " + codeString);
        return res.status(401).json({ error: 'Client not found' });
    }
    
    const redirectUrl = requestBody.url;
    if (redirectUrl) {
        logMessage("redirect client to url: " + redirectUrl);
        sendRedirectURLToClient(codeString, redirectUrl);
        res.json({ message: 'Success, redirected' });
    } else {
        res.json({ message: 'Success' });
    }
    
});

const server = createServer(app);
var io = require('socket.io')(server);

io.sockets.on('connection', socket => {
    const clientAddress = socket.handshake.address;
    logMessage('>>> client new: ' + clientAddress);
    
    socket.on('token', token => {
        secretTokens.set(socket.id, token);
        logMessage('add token: ' + token + ", client: " + clientAddress);
    });
    
    socket.on('disconnect', () => {
        let success = secretTokens.delete(socket.id);
        logMessage("disconnect client: " + clientAddress + ", removed from storage: " + success);
    });
});

var port = 443;
server.listen(port, function () {
    console.log("Run");
});

function findClientIdWithCode(text) {
    for (const [client, codeString] of secretTokens.entries()) {
        if (text === codeString) {
            return client;
        }
    }
    return null;
}

function sendRedirectURLToClient(codeString, redirectUrl) {
    const socketId = findClientIdWithCode(codeString);
    io.to(socketId).emit(codeString, redirectUrl);
    logMessage(">>>> send redirect url to socketID: " + socketId + ", codestring: " + codeString + ", redirectURL: " + redirectUrl);
}

function logMessage(message) {
    //    console.log(message);
}

