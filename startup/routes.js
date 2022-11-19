const express = require('express');
const morgan = require('morgan');
const tours = require('../routes/tours');
const users = require('../routes/users');
const admin = require('../routes/admin');
const error = require('../middleware/error');
const AppError = require('../utils/appError');

module.exports = function (app) {
  app.use(express.json());
  app.use(express.static(`${__dirname}/../public`));
  if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
  app.use('/api/v1/tours', tours);
  app.use('/api/v1/users', users);
  app.use('/api/v1/admin', admin);

  app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  });

  app.use(error); //error middleware for when request handlers fails
};
