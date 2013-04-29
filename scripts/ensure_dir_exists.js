var fs     = require('fs')
  , core   = require('../core')
  , mkdirp = require('mkdirp')
  , path   = require('path');

module.exports = function (state, dir, cb) {
    level = core.isString(dir) ? 'debug' : (dir.quiet === false ? 'info' : debug);
    dir   = core.isString(dir) ? dir : (dir.dir || dir.path);
    dir   = path.resolve(dir);
    log   = state.log;

    fs.stat(dir, function (err, stat) {
        if (err || !stat.isDirectory()) {
            mkdirp(dir, function (err) {
                if (!err && log && log[level]) {
                    log[level]('directory ' + dir.green + ' created');
                }
                cb(err);
            });
        } else {
            if (log && log[level]) {
                log[level]('directory ' + dir.blue + ' already exists');
            }
            cb();
        }
    });
};

