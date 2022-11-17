const express = require('express');
const _ = require('lodash');
const User = require('../models/user');
const AppError = require('../utils/appError');
const auth = require('../middleware/auth');

const router = express.Router();

// const users = JSON.parse(
//   fs.readFileSync(path.join(__dirname, '..', 'dev-data', 'data', 'users.json'))
// );

router.post('/signup', async (req, res) => {
  const user = new User(_.pick(req.body, ['name', 'email', 'password', 'passwordChangedAt', 'role']));
  await User.create(user);

  const token = user.generateAuthToken();

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: _.pick(user, ['_id', 'name', 'role', 'email']),
    },
  });
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) return next(new AppError('Incorrect email or password'), 401);

  const token = user.generateAuthToken();
  res.status(200).json({
    status: 'success',
    token,
  });
});

router.post('/forgotPassword', async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('User does not exist', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save();
  res.send('not yet implemented');
});

router.post('/resetPassword', (req, res) => {
  res.send('not yet implemented');
});

// router.post('/', async (req, res) => {
//   res.send('not yet implemented');
// });

// router.patch('/:id', async (req, res) => {
//   // if(!tour) return res.status(404).send(`Tour with id ${req.params.id} not found`)
//   res.send('Updated');
// });

module.exports = router;
