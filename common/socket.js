'use strict';

const socketIO = require('socket.io');
const { logger: logger} = require('../middleware/logger');

const secretTokens = new Map();

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
        secretTokens.set(socket.id, data);
        logger.info(`login client:` + data);
    });

    socket.on('disconnect', () => {
        let success = secretTokens.delete(socket.id);
        logger.info(`disconnect client: ${clientAddress}, removed from storage: ${success}`);
    });
};

const sendRedirectURLToClient = function (codeString, redirectUrl) {
    io.emit(codeString, redirectUrl);
    logger.info(
        `send redirect url for code string: ${codeString}, redirectURL: ${redirectUrl}`,
    );
    // io.timeout(10000).emitWithAck(codeString, redirectUrl, (err, val) => {
    //     logger.info(
    //         `send redirect url for code string with ack. Value: ${val}, error: ${err}`,
    //     );
    // });
};

const findClientIdWithCode = function (text) {
    for (const [client, codeString] of secretTokens.entries()) {
        if (text === codeString) {
            return client;
        }
    }
    return null;
};

module.exports.getSocketIO = getSocketIO;
module.exports.createSocketIO = createSocketIO;
module.exports.onConnectionSocketIO = onConnectionSocketIO;
module.exports.sendRedirectURLToClient = sendRedirectURLToClient;
module.exports.findClientIdWithCode = findClientIdWithCode;