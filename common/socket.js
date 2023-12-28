'use strict';

const socketIO = require('socket.io');
const { logger: logger} = require('../middleware/logger');

const tokensOnTV = new Set();

let io;
const getSocketIO = function () {
    return io;
};

const createSocketIO = function (server) {
    if (io) {
        return io;
    }

    io = socketIO(server);
    return io;
};

const onConnectionSocketIO = function (io, socket) {
    const clientAddress = socket.handshake.address;
    logger.info(`client new: ${clientAddress}`);

    socket.on('login', (data) => {
        tokensOnTV.add(data);
        logger.info(`login client:` + data);
    });

    socket.on('disconnect', () => {
        logger.info(`disconnect client: ${clientAddress}`);
    });
};

const sendRedirectURLToClient = function (codeString, redirectUrl) {
    // io.emit(codeString, redirectUrl);
    // logger.info(
    //     `send redirect url for codestring: ${codeString}, redirectURL: ${redirectUrl}`,
    // );
    tokensOnTV.delete(codeString);
    io.timeout(10000).emitWithAck(codeString, redirectUrl, (err, val) => {
        logger.info(
            `send redirect url for code string with ack. Value: ${val}, error: ${err}`,
        );
    });
};
const checkClient = function (codeString) {
    return tokensOnTV.has(codeString);
};

module.exports.getSocketIO = getSocketIO;
module.exports.createSocketIO = createSocketIO;
module.exports.onConnectionSocketIO = onConnectionSocketIO;
module.exports.sendRedirectURLToClient = sendRedirectURLToClient;
module.exports.checkClient = checkClient;