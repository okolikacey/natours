const AppError = require('../utils/appError');

module.exports = (validator) => (req, res, next) => {
  const { error } = validator(req.body);
  if (error) next(new AppError(error.details[0].message, 400));
  next();
};
