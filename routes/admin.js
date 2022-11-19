const express = require('express');
const auth = require('../middleware/auth');
const restricttTo = require('../middleware/restricttTo');
const User = require('../models/user');

const router = express.Router();

router.get('/users', [auth, restricttTo('admin')], async (req, res) => {
  const users = await User.find();

  res.json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

module.exports = router;
