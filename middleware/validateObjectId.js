const mongoose = require('mongoose');

module.exports = function (req, res, next) {
  const message = `Invalid ID: ${req.params.id}.`;
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ status: 'fail', message });
  next();
};
