const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const restricttTo = require('../middleware/restricttTo');
const AppError = require('../utils/appError');
const setTourUserIds = require('../middleware/setTourUserIds');

exports.deleteOne = (Model, router) =>
  router.delete('/:id', [validateObjectId, auth, restricttTo('admin', 'lead-guide')], async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError(`Document with id ${req.params.id} not found`, 404));

    res.status(204).send({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model, router) =>
  router.patch('/:id', validateObjectId, async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError(`Document with id ${req.params.id} not found`, 404));

    res.send({
      status: 'success',
      data: { date: doc },
    });
  });

exports.createOne = (Model, router) =>
  router.post('/', [auth, restricttTo('user'), setTourUserIds], async (req, res) => {
    const doc = await Model.create(req.body);

    res.json({
      status: 'success',
      data: { data: doc },
    });
  });
