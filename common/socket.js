'use strict';

const socketIO = require('socket.io');
const { logger: logger } = require('../middleware/logger');

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

  socket.on('disconnect', () => {
    logger.info(`disconnect client: ${clientAddress}`);
  });
};

const sendRedirectURLToClient = function (codeString, redirectUrl) {
  io.emit(codeString, redirectUrl);
  logger.info(
    `send redirect url for codestring: ${codeString}, redirectURL: ${redirectUrl}`,
  );
};

module.exports.getSocketIO = getSocketIO;
module.exports.createSocketIO = createSocketIO;
module.exports.onConnectionSocketIO = onConnectionSocketIO;
module.exports.sendRedirectURLToClient = sendRedirectURLToClient;
