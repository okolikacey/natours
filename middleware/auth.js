const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/user');
const AppError = require('../utils/appError');

async function auth(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];

  if (!token) return next(new AppError('Access Denied. No token provided', 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWTPRIVATEKEY);
  const user = await User.findById(decoded._id);
  if (!user) return next(new AppError('The user no longer exist', 401));

  if (user.changedPasswordAfter(decoded.iat)) return next(new AppError('Password recently changed', 401));

  req.user = user;
  next();
}

module.exports = auth;
