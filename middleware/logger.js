const { createLogger, format, transports } = require('winston');
const { combine } = format;

const options = {
  console: {
    level: 'debug',
    format: combine(
      format.colorize({ all: true }), // color text in console IDE
      format.splat(), // string interpolation splat for %d %s-style messages
      format.simple(), // simple text format logs
    ),
  },
};

let logger = createLogger({
  transports: [new transports.Console(options.console)],
  exitOnError: false,
});

logger.stream = {
  write: function (message, encoding) {
    logger.info(message);
  },
};

module.exports.logger = logger;
