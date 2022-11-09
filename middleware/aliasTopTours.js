module.exports = function (req, res, next) {
  if (req.path === '/top-5-cheap') {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  } else {
    next();
  }
};
