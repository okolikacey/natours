const winston = require('winston'); //for error logging

module.exports = function (err, req, res, next) {
  winston.error(err.message, err);
  res.status(500).json({
    status: 'failed',
    message: err.message,
  });
};
