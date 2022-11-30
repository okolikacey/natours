const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const restricttTo = require('../middleware/restricttTo');
const AppError = require('../utils/appError');

exports.deleteOne = (Model, router) =>
  router.delete('/:id', [validateObjectId, auth, restricttTo('admin', 'lead-guide')], async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError(`Document with id ${req.params.id} not found`, 404));

    res.status(204).send({
      status: 'success',
      data: null,
    });
  });
