module.exports = function (state, options, cb) {
    var log = state.log;

    state.srv1 = {};
    state.srv2 = {};

    state.srv1.kill = function () {
        log.info('server 1 terminated.');
    };
    state.srv2.kill = function () {
        log.info('server 2 terminated.');
    };

    log.info('server1 started on port ' + options.port1);
    log.info('server2 started on port ' + options.port2);

    cb();
};

