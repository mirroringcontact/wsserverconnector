
'use strict';

const express = require('express');
const path = require('path');
const { createServer } = require('http');

const WebSocket = require('ws');
const secretTokens = new Map();

const app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.get('/token', (req, res) => {
    //http://localhost:8080/token/?token=630722&port=4444  
    const token = req.query.token;
    const ip = req.query.port;
    console.log("Mobile send token: ", token, " ip: ", ip);  
    const foundClient = findClientByToken(token); 

    if (foundClient) {
        foundClient.send(ip);
        console.log("Found ws client, redirect to: ", ip);
    } else {
        console.log("Client ws not found");
    }
    res.send('GET request handled');
  });
const server = createServer(app);
const wss = new WebSocket.Server({ server }); 

wss.on('connection', function (ws) { 
  console.log('client new: ');
  ws.onmessage = function(event) {
      const token = event.data; 
      if (secretTokens.has(token)) { 
        console.log('token already is used:', token);
      } else {
        console.log('add token', token);
        secretTokens.set(token, ws); 
      }
  }; 
  ws.on("close", () => { 
    console.log("close client, tokens ", secretTokens);
    secretTokens.forEach((client, token) => {
      if (client === ws) {
        console.log("remove Client with token: ", token); 
        secretTokens.delete(token);
      }
    });
  });
});

var port = 443;
server.listen(port, function () {
  console.log('Listening on', port);
});

function findClientByToken(token) {
  return secretTokens.get(token);
}