const { createLogger, transports } = require('winston');
// require('winston-mongodb'); //for error logging to mongodb
require('express-async-errors'); //capture errors on endpoint calls

// const dbInstance = process.env.DATABASE;

const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logfile.log', level: 'error' }),
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: 'exceptions.log' }),
    // new transports.MongoDB({
    //   level: 'error',
    //   db: dbInstance,
    //   options: {
    //     useUnifiedTopology: true,
    //   },
    // }),
  ],
  rejectionHandlers: [
    new transports.Console(),
    new transports.File({ filename: 'rejections.log' }),
    // new transports.MongoDB({
    //   level: 'error',
    //   db: dbInstance,
    //   options: {
    //     useUnifiedTopology: true,
    //   },
    // }),
  ],
  handleExceptions: true,
  handleRejections: true,
});

module.exports = logger;
