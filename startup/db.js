const mongoose = require('mongoose');
const logger = require('../utils/logging');

const dbInstance = process.env.DATABASE.replace('<PASSWORD>', process.env.DBPASSWORD);

module.exports = function () {
  mongoose.connect(dbInstance).then(() => logger.info(`Connected to database`));
};
