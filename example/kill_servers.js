module.exports = function (state, options, cb) {
    var srv1 = state.srv1
      , srv2 = state.srv2;

    srv1.kill();
    srv2.kill();

    cb();
};
