const express = require('express');
const { Tour } = require('../models/tour');
const validateObjectId = require('../middleware/validateObjectId');
const aliasTopTours = require('../middleware/aliasTopTours');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const auth = require('../middleware/auth');
const review = require('./reviews');
const restrictTo = require('../middleware/restrictTo');

// const Review = require('../models/review');

const router = express.Router();

router.use('/:tourId/reviews', review); //forward to reviews since route is for review activities

router.get('/tour-stats', async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.json({
    status: 'success',
    data: { stats },
  });
});

router.get('/monthly-plan/:year', [auth, restrictTo('admin', 'lead-guide', 'guide')], async (req, res) => {
  const year = Number(req.params.year);

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.json({
    status: 'success',
    data: { plan },
  });
});

router.get(['/', '/top-5-cheap'], aliasTopTours, async (req, res) => {
  //execute querys
  const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
  const tours = await features.query;
  res.json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

router.get('/:id', validateObjectId, async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  if (!tour) return next(new AppError(`Tour with id ${req.params.id} not found`, 404));
  res.json({
    status: 'success',
    data: { tour },
  });
});

router.post('/', [auth, restrictTo('admin', 'lead-guide')], async (req, res) => {
  const newTour = await Tour.create(req.body);

  res.json({
    status: 'success',
    data: { tour: newTour },
  });
});

router.patch('/:id', [validateObjectId, auth, restrictTo('admin', 'lead-guide')], async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) return next(new AppError(`Tour with id ${req.params.id} not found`, 404));

  res.send({
    status: 'success',
    data: { tour },
  });
});

router.delete('/:id', [validateObjectId, auth, restrictTo('admin', 'lead-guide')], async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) return next(new AppError(`Tour with id ${req.params.id} not found`, 404));

  res.status(204).send({
    status: 'success',
    data: null,
  });
});

module.exports = router;
