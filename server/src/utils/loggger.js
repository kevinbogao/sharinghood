const { createLogger, transports, format } = require('winston');
require('winston-mongodb');

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  transports: [
    new transports.MongoDB({
      db: process.env.MONGO_PATH,
      options: {
        useUnifiedTopology: true,
        sslValidate: false,
      },
    }),
  ],
});

module.exports = logger;
