'use strict';

const socketIO = require('socket.io');
const { logger: logger } = require('../middleware/logger');

let io;
const secretTokens = new Map();

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

  socket.on('token', (token) => {
    secretTokens.set(socket.id, token);
    logger.info(`add token: ${token}, client: ${clientAddress}`);
  });

  socket.on('disconnect', () => {
    let success = secretTokens.delete(socket.id);
    logger.info(`disconnect client: ${clientAddress}, removed from storage: ${success}`);
  });
};

const sendRedirectURLToClient = function (socketId, codeString, redirectUrl) {
  io.to(socketId).emit(codeString, redirectUrl);
  logger.info(
    `send redirect url to socketID: ${socketId}, codestring: ${codeString}, redirectURL: ${redirectUrl}`,
  );
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
module.exports.findClientIdWithCode = findClientIdWithCode;
module.exports.sendRedirectURLToClient = sendRedirectURLToClient;
