module.exports = function (state, options, cb) {
    var srv1 = state.srv1
      , srv2 = state.srv2;

    if (srv1) { srv1.kill(); }
    if (srv2) { srv2.kill(); }

    cb();
};
