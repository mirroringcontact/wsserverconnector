'use strict';

const commonSocket = require('../common/socket');
const { logger: logger } = require('../middleware/logger');
const tokensOnTV = new Set();

exports.checkRedirect = async (req, res, next) => {
  try {
    if (req.headers.authorization !== process.env.PRIVATE_KEY) {
      const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      console.debug('Unauthorized client: ', clientIP);
      return res.status(401).json({ error: 'unauthorized' });
    }

    if (!req.body.qrcode) {
      return res.status(401).json({ error: 'Error 3' });
    }

    const socketId = commonSocket.findClientIdWithCode(req.body.qrcode);
    if (!socketId) {
      logger.info(`client not found for code: ${req.body.qrcode}`);
      return res.status(401).json({ error: 'Client not found' });
    }

    if (req.body.url) {
      logger.info(`redirect client to url: ${req.body.url}`);
      commonSocket.sendRedirectURLToClient(req.body.qrcode, req.body.url);
      res.json({ message: 'Success' });
    } else {
        res.json({ message: 'Success' });
    }
  } catch (err) {
    console.log(err);
    err.status = 500;
    return next(err);
  }
};
