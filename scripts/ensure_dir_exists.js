var fs     = require('fs')
  , mkdirp = require('mkdirp')
  , path   = require('path');

module.exports = function (dir, cb) {
    dir = path.resolve(dir);

    fs.stat(dir, function (err, stat) {
        if (err || !stat.isDirectory()) {
            mkdirp(dir, cb);
        } else {
            cb();
        }
    });
};

