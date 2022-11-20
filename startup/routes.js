const express = require('express');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const tours = require('../routes/tours');
const users = require('../routes/users');
const admin = require('../routes/admin');
const error = require('../middleware/error');
const AppError = require('../utils/appError');

module.exports = function (app) {
  app.use(express.json({ limit: '10kb' }));
  app.use(mongoSanitize()); //Data sanitization against noSQL query injection
  app.use(xss()); //Data sanitization against cross site scripting
  app.use(hpp({ whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'price', 'difficulity'] })); //Prevent parameter pollution
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
