import Audit from "../../DB/models/audit.model.js";
import { LoggerService } from "../services/logger/logger.service.js";

// logger from winston
const logger = new LoggerService("auditLogger");

export const auditMiddleware = async (
  auditAction,
  auditStatus,
  auditBy,
  auditOn,
) => {
  try {
    await Audit.create(
      auditAction,
      auditStatus,
      auditBy,
      auditOn,
    );
  } catch (error) {
    logger.error("Error capturing audit log:", error);
  }
};
