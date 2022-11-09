const express = require('express');
const morgan = require('morgan');
const tours = require('../routes/tours');
const users = require('../routes/users');
const error = require('../middleware/error');

module.exports = function (app) {
  app.use(express.json());
  app.use(express.static(`${__dirname}/../public`));
  if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
  app.use('/api/v1/tours', tours);
  app.use('/api/v1/users', users);

  app.use(error); //error middleware for when request handlers fails
};
