const http = require('http');
const socketIo = require('socket.io');

// Создание HTTP сервера
console.log('> Start: ' + socket.id);
const server = http.createServer((req, res) => {
    // Обработка HTTP запросов
    // ...
    console.log('> Request: ' + socket.id);
});

const io = socketIo(server);

const clients = new Map();

io.on('connection', (socket) => {
    console.log('Новое подключение: ' + socket.id);

    // Сохранение ссылки на каждый сокет с его уникальным ID
    clients.set(socket.id, socket);

    socket.on('disconnect', () => {
        clients.delete(socket.id);
        console.log('Клиент отключился: ' + socket.id);
    });
});

// Функция для отправки сообщения клиенту
function sendToClient(codeString, url) {
    clients.forEach((client, clientId) => {
        client.emit(codeString, { message: url });
    });
}

// Здесь вы можете добавить обработку ваших HTTP запросов или другой логики

const port = 443;
server.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});

// const http = require('http');
// const socketIo = require('socket.io');
// const path = require('path');
// const fs = require('fs');

// const secretTokens = new Map();

// // Создание HTTP сервера
// const server = http.createServer((req, res) => {
//     if (req.method === 'GET' && req.url === '/') {
//         fs.readFile(path.join(__dirname, '/public/index.html'), (err, data) => {
//             if (err) {
//                 res.writeHead(404);
//                 res.end('Error: File Not Found');
//             } else {
//                 res.writeHead(200, { 'Content-Type': 'text/html' });
//                 res.end(data);
//             }
//         });
//     }
// });

// // Подключение Socket.IO
// const io = socketIo(server);

// io.on('connection', (socket) => {
//     logMessage('client new: ' + socket.id);

//     socket.on('token', (token) => {
//         secretTokens.set(socket.id, token);
//         logMessage('add token: ' + token + ", client: " + socket.id);
//     });

//     socket.on('disconnect', () => {
//         let success = secretTokens.delete(socket.id);
//         logMessage("disconnect client: " + socket.id + ", removed from storage: " + success);
//     });

//     // Для обработки запроса на перенаправление
//     socket.on('redirect', (data) => {
//         const token = data.token;
//         const redirectUrl = data.url;
//         const client = findClientByToken(token);

//         if (client && redirectUrl) {
//             logMessage("redirect client to url: " + redirectUrl);
//             io.to(client).emit('redirect', redirectUrl);
//         }
//     });
// });

// // Найти клиента по токену
// function findClientByToken(token) {
//     for (const [id, storedToken] of secretTokens.entries()) {
//         if (token === storedToken) {
//             return id;
//         }
//     }
//     return null;
// }

// function logMessage(message) {
//     console.log(message);
// }

// var port = 443;
// server.listen(port, () => {
//     console.log("Server running on port " + port);
// });
