import { createLogger, config, format, transports } from "winston";
import path from "path";
// date + LoggerLevel + message
const dateFormate = () => {
  return new Date(Date.now()).toLocaleString();
};
export class LoggerService {
  constructor(route) {
    const logger = createLogger({
      levels: config.syslog.levels,
      format: format.printf((info) => {
        let message = `${dateFormate()} | ${info.level.toUpperCase()} | ${
          info.message
        } | `;
        message = info.obj
          ? message + `data ${JSON.stringify(info.obj)} | `
          : message;
        return message;
      }),
      transports: [
        new transports.Console({
          level: "info",
          format: format.combine(
            format.prettyPrint()
          ),
        }),
        new transports.File({
          filename: path.resolve(`src/services/logger/log/${route}.log`),
          level: "error",
          format : format.errors({ stack: true }),
        }),
      ],
    });

    this.logger = logger;
  }

  async info(message) {
    this.logger.log("info", message);
  }
  async info(message, obj) {
    this.logger.log("info", message, { obj });
  }
  async error(message) {
    this.logger.log("error", message);
  }
  async error(message,obj) {
    this.logger.log("error", message, { obj });
  }
  async debug(message) {
    this.logger.log("debug", message);
  }
  async debug(message,obj) {
    this.logger.log("debug", message, { obj });
  }
}
