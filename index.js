// const http = require('http');
// const socketIo = require('socket.io');
// const fs = require('fs');
// const path = require('path');

// const secretTokens = new Map();

// // Создание HTTP сервера
// const server = http.createServer((req, res) => {
//     // Простой обработчик запросов для сервера
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

// // Подключение Socket.IO к серверу
// const io = socketIo(server);

// io.on('connection', (socket) => {
//     console.log('Новое подключение: ' + socket.id);

//     socket.on('register', (codeString) => {
//         secretTokens.set(codeString, socket.id);
//         console.log('Код зарегистрирован: ' + codeString);
//     });

//     // Здесь можно добавить дополнительную логику для обработки запросов от клиента
// });

// // Обработка HTTP запросов для перенаправления
// server.on('request', (req, res) => {
//     if (req.method === 'POST' && req.url === '/redirect') {
//         let body = '';
//         req.on('data', chunk => {
//             body += chunk.toString();
//         });
//         req.on('end', () => {
//             const data = JSON.parse(body);
//             const clientSocketId = secretTokens.get(data.qrcode);
//             if (clientSocketId) {
//                 io.to(clientSocketId).emit(data.qrcode, { message: data.url });
//                 res.writeHead(200, { 'Content-Type': 'application/json' });
//                 res.end(JSON.stringify({ message: 'Success, redirected' }));
//             } else {
//                 res.writeHead(404);
//                 res.end('Client not found');
//             }
//         });
//     }
// });

// const port = 443;
// server.listen(port, () => {
//     console.log(`Сервер запущен на порту ${port}`);
// });
