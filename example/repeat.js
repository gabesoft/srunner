module.exports = function (state, options, cb) {
    var limit = options.repeatCount;
    var count = state.count || 0;
    if (limit && limit > count) {
        state.log.warn('repeat ' + (count + 1) + ' times');
        state.count = count + 1;
        state.runner.run(cb);
    } else {
        cb();
    }
};
