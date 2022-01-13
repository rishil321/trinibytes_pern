import winston from "winston";
import { dbConfig } from "../configs/db.config.js";

const { format } = winston;

const cliLogger = winston.createLogger({
  level: "debug",
  format: format.combine(
    format.splat(),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.prettyPrint(),
    winston.format.colorize()
  ),
  transports: [
    new winston.transports.File({ filename: "trinibytes_express.log" }),
  ],
});

const Sequelize = require("sequelize");
let sequelize;
if (process.env.NODE_ENV === "production") {
  sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,
    logging: true,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  });
} else {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite3",
  });
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.CaribbeanJobsPost = require("./caribbeanJobsPost.model.js")(
  sequelize,
  Sequelize
);
//enable force true to drop table and recreate
db.sequelize
  .sync({ force: false, alter: true })
  .then(() => {
    cliLogger.debug("Sequelize sync completed successfully.");
  })
  .catch((e) => {
    cliLogger.error(`Sequelize sync failed ${e.message} ${e.stack}`);
  });

module.exports = db;
