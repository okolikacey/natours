const express = require('express');
const Review = require('../models/review');
const auth = require('../middleware/auth');
// const restricttTo = require('../middleware/restricttTo');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const validateObjectId = require('../middleware/validateObjectId');
const restricttTo = require('../middleware/restricttTo');

const router = express.Router();

router.get('/', auth, async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query).filter().sort().limitFields().paginate();
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
  const review = req.body;
  if (!review) return next(new AppError('Review cannot be empty', 400));

  await Review.create(review);

  res.json({
    status: 'success',
    data: { review },
  });
});

module.exports = router;
