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

// Log server request
export const requestLogger = {
  requestDidStart() {
    return {
      willSendResponse(requestContext: any) {
        if (requestContext.response.errors) {
          // Log error if errors are encountered
          logger.log(
            "error",
            `Request for ${requestContext.request.operationName}`,
            {
              query: requestContext.request.query,
              variables: requestContext.request.variables,
              error: requestContext.response.errors[0].message,
            }
          );
        } else {
          // Log request
          logger.log(
            "info",
            `Request for ${requestContext.request.operationName}`,
            {
              query: requestContext.request.query,
              variables: requestContext.request.variables,
            }
          );
        }
      },
    };
  },
};
