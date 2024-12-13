import express from "express";
import connectDB from "./DB/dbConnection.js";
import { config } from "dotenv";
import { init } from "./src/server.routes.js";
import { LoggerService } from "./src/services/logger/logger.service.js";
import cors from "cors";
import morgan from "morgan";


config({ path: "./config/dev.config.env" });
const app = express();
//morgan
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
}
// DB Connection
await connectDB();
//cors
app.use(cors());
app.options("*", cors());
// API routes
init(app, express);

// logger from winston
const logger = new LoggerService("serverLogger");

const port = 4001;
app.listen(process.env.PORT || port, () => {
  console.log(`server is running..! `); //port can be string or number
});
