const AppError = require('../utils/appError');

async function setTourUserIds(req, res, next) {
  if (req.baseUrl !== '/api/v1/reviews') next();
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body) return next(new AppError('Review cannot be empty', 400));
  next();
}

module.exports = setTourUserIds;
