'use strict';

const dotenv = require('dotenv');
const express = require('express');
const routes_redirects = require('./routes/redirects');
const logger = require('./middleware/logger').logger;

dotenv.config();

let app = express();
console.log(process.env.NODE_ENV);
app.use(express.json());

// routes
app.use('/', express.static(__dirname + '/public'));
app.use('/redirect', routes_redirects);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${
      req.ip
    }`,
  );
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.sendStatus(err.status || 500);
});

module.exports = app;
