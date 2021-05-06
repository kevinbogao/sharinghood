import { createLogger, transports, format, Logger } from "winston";
require("winston-mongodb");

const logger: Logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.metadata({ fillExcept: ["message", "level", "timestamp"] })
  ),
  transports: [
    // @ts-ignore
    new transports.MongoDB({
      db: process.env.MONGO_PATH,
      options: {
        useUnifiedTopology: true,
        sslValidate: false,
      },
    }),
  ],
});

export default logger;
