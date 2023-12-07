
'use strict'; 
const express = require('express');
const path = require('path');
const { createServer } = require('http');
const WebSocket = require('ws');
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
    
    const qrcode = requestBody.qrcode;
    if (!qrcode) {
        return res.status(401).json({ error: 'Error 3' });
    }
    
    const client = findClientByToken(qrcode);
    if (!client) {
        logMessage("client not found for code: " + qrcode);
        return res.status(401).json({ error: 'Client not found' });
    }
     
    const redirectUrl = requestBody.url;
    if (redirectUrl) {
        logMessage("redirect client to url: " + redirectUrl);
        client.send(redirectUrl);
        res.json({ message: 'Success, redirected' });
    } else {
        res.json({ message: 'Success' });
    }
     
});

const server = createServer(app);
//const wss = new WebSocket.Server({ server });
//wss.on('connection', function (ws, req) {
//    const clientAddress = req.socket.remoteAddress;
//    logMessage('client new: ' + clientAddress);
//    
//    ws.onmessage = function(event) {
//        const token = event.data;
//        secretTokens.set(ws, token);
//        logMessage('add token: ' + token + ", client: " + clientAddress);
//    };
//    
//    ws.on("close", () => {
//        let success = secretTokens.delete(ws);
//        logMessage("disconnect client: " + clientAddress + ", removed from storage: " + success);
//    });
//});
  
var io = require('socket.io')(server);
//io.sockets.on("connection", function(socket) {
//    logMessage('>>> Новое подключение: ' + socket.id);
//    io.emit('hello', 'Hola soy el servidor'.toString());
//    
//    socket.on("clientside", function(args) {
//        logMessage('>>> clientside: ' + args);
//    })
//})
 
io.sockets.on('connection', socket => {
 const clientAddress = socket.handshake.address;
 logMessage('>>> client new: ' + clientAddress);

 socket.on('message', token => {
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
