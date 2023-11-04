
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
    //console.log("Mobile send token: ", token, " ip: ", ip);
    const foundClient = findClientByToken(token);
    
    if (foundClient) {
        foundClient.send(ip);
        //console.log("Found ws client, redirect to: ", ip);
    } else {
        //console.log("Client ws not found");
    }
    res.send('GET request handled');
});
const server = createServer(app);
const wss = new WebSocket.Server({ server });
console.log("Run");
wss.on('connection', function (ws, req) {
    const clientAddress = req.socket.remoteAddress;
    console.log('client new:', clientAddress);
    
    ws.onmessage = function(event) {
        const token = event.data;
        secretTokens.set(ws, token);
        console.log('add token', token);
//        if (secretTokens.has(ws)) {
//            //console.log('token already is used:', token);
//        } else {
            //console.log('add token', token);
//        }
    };
    ws.on("close", () => {
        let success = secretTokens.delete(ws);
        console.log("disconnect client, removed from storage: ", success);
//        secretTokens.forEach((client, token) => {
//            if (client === ws) {
//                console.log("remove Client with token: ", token);
//                secretTokens.delete(token);
//            }
//        });
    });
});

var port = 443;
server.listen(port, function () {
    //console.log('Listening on', port);
});

function findClientByToken(token) {
    return secretTokens.get(token);
}

