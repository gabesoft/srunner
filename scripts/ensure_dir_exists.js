var fs     = require('fs')
  , core   = require('../core')
  , mkdirp = require('mkdirp')
  , path   = require('path');

module.exports = function (state, dir, cb) {
    levelCreated = core.isString(dir) ? 'info' : (dir.quiet ? 'debug' : 'info');
    levelExists  = core.isString(dir) ? 'warn' : (dir.quiet ? 'debug' : 'warn');

    dir = core.isString(dir) ? dir : (dir.dir || dir.path);
    dir = path.resolve(dir);
    log = state.log;

    fs.stat(dir, function (err, stat) {
        if (err || !stat.isDirectory()) {
            mkdirp(dir, function (err) {
                if (!err && log && log[levelCreated]) {
                    log[levelCreated]('directory ' + dir.green + ' created');
                }
                cb(err);
            });
        } else {
            if (log && log[levelExists]) {
                log[levelExists]('directory ' + dir.blue + ' already exists');
            }
            cb();
        }
    });
};

