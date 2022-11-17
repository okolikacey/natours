const AppError = require('../utils/appError');

module.exports =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) next(new AppError('You do not have permission to perform this action', 403));

    next();
};
