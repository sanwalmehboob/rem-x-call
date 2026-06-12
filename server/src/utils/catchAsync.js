/**
 * Catch async errors in Express routes
 * @param {Function} fn
 * @returns {Function}
 */
const catchAsync = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
