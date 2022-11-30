const express = require('express');
const _ = require('lodash');
const crypto = require('crypto');
const User = require('../models/user');
const AppError = require('../utils/appError');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/email');

const router = express.Router();

const createSendToken = (user, statusCode, res) => {
  const token = user.generateAuthToken();
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWTCOOKIEEXPIRESIN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: _.pick(user, ['_id', 'name', 'role', 'email']),
    },
  });
};

router.post('/signup', async (req, res) => {
  const user = new User(_.pick(req.body, ['name', 'email', 'password', 'passwordChangedAt', 'role']));
  await User.create(user);

  createSendToken(user, 201, res);
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) return next(new AppError('Incorrect email or password'), 401);

  createSendToken(user, 200, res);
});

router.patch('/updatePassword', auth, async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const correctPass = await user.correctPassword(req.body.passwordCurrent, user.password);
  if (!correctPass) return next(new AppError('Password provided does not match the current password', 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  createSendToken(user, 200, res);
});

router.post('/forgotPassword', async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('User does not exist', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save();

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return next(new AppError('There was an error sending the email. Try again later', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
});

router.patch('/resetPassword/:token', async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  createSendToken(user, 200, res);
});

router.patch('/updateMe', auth, async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) return next(new AppError('This route is not for password updates', 400));

  const filteredBody = _.pick(req.body, ['name', 'email']);
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, { new: true, runValidators: true });

  res.json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

router.post('/', async (req, res) => {
  res.send('not yet implemented');
});

router.patch('/:id', async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return next(new AppError(`Tour with id ${req.params.id} not found`, 404));

  res.send({
    status: 'success',
    data: { user },
  });
});

module.exports = router;
