module.exports = function (state, options, cb) {
    state.log.info('doing something...' + JSON.stringify(options));
    cb();
};

