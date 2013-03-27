module.exports = function (state, options, cb) {
    state.srv1 = {};
    state.srv2 = {};

    state.srv1.kill = function () {
        console.log('Server 1 terminated.');
    };
    state.srv2.kill = function () {
        console.log('Server 2 terminated.');
    };

    console.log('Server1 started on port ' + options.port1);
    console.log('Server2 started on port ' + options.port2);

    cb();
};

