'use strict';

const http = require('http');

const app = require('../app');
const commonUtils = require('../common/utils');
const commonSocket = require('../common/socket');
const { logger: logger } = require('../middleware/logger');

let port = commonUtils.normalizePort(process.env.PORT || '5000');

let onServerListening = () => {
  let addr = server.address();
  let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  logger.info('🚀 Listening on %s, NodeEnv %s', bind, process.env.NODE_ENV);
};

let server = http.createServer(app);
const io = commonSocket.createSocketIO(server);

io.on('connection', (socket) => {
  commonSocket.onConnectionSocketIO(io, socket);
});

app.set('port', port);
server.listen(port);
server.on('listening', onServerListening);
