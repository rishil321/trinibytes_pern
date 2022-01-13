'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import Sequelize from 'sequelize';
import enVariables from '../configs/dbconfig.json';
import winston from "winston";
const { format } = winston;
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = enVariables[env];
const db = {};

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
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    // eslint-disable-next-line global-require,import/no-dynamic-require
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.CaribbeanJobsPost = require("./caribbeanJobsPost.model.js")(sequelize, Sequelize);
//enable force true to drop table and recreate
db.sequelize
    .sync({ force: false, alter: true })
    .then(() => {
      cliLogger.debug("Sequelize sync completed successfully.");
    })
    .catch((e) => {
      cliLogger.error(`Sequelize sync failed ${e.message} ${e.stack}`);
    });

export default db;
