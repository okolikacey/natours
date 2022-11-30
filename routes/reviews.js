const express = require('express');
const Review = require('../models/review');
const auth = require('../middleware/auth');
// const restricttTo = require('../middleware/restricttTo');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const validateObjectId = require('../middleware/validateObjectId');
const restricttTo = require('../middleware/restricttTo');

const router = express.Router({ mergeParams: true }); //merge params for getting the tourId

router.get('/', auth, async (req, res, next) => {
  const filter = {};
  if (req.params.tourId) {
    filter.tour = req.params.tourId;
  }
  const features = new APIFeatures(Review.find(filter), req.query).filter().sort().limitFields().paginate();
  const reviews = await features.query;
  res.json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

router.get('/:id', [auth, validateObjectId], async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError(`Review with id ${req.params.id} not found`, 404));

  res.json({
    status: 'success',
    data: { review },
  });
});

router.post('/', [auth, restricttTo('user')], async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body) return next(new AppError('Review cannot be empty', 400));

  const review = await Review.create(req.body);

  res.json({
    status: 'success',
    data: { review },
  });
});

router.delete('/:id', [validateObjectId, auth, restricttTo('admin', 'lead-guide')], async (req, res, next) => {
  const doc = await Review.findByIdAndDelete(req.params.id);
  if (!doc) return next(new AppError(`Review with id ${req.params.id} not found`, 404));

  res.status(204).send({
    status: 'success',
    data: null,
  });
});

module.exports = router;
