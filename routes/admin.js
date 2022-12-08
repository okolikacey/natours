const express = require('express');
const auth = require('../middleware/auth');
const restrictTo = require('../middleware/restrictTo');
const User = require('../models/user');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

const router = express.Router();

router.use(auth, restrictTo('admin'));

router.get('/users', async (req, res) => {
  const features = new APIFeatures(User.find(), req.query).filter().sort().limitFields().paginate();
  const users = await features.query;

  res.json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

router.patch('/users/:id', async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return next(new AppError(`User with id ${req.params.id} not found`, 404));
  res.send({
    status: 'success',
    data: { user },
  });
});

router.delete('/users/:id', async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: false },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) return next(new AppError(`User with id ${req.params.id} not found`, 404));
  res.send({
    status: 'success',
    data: { user },
  });
});

module.exports = router;
