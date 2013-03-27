var fs   = require('fs')
  , path = require('path');

module.exports = function (state, dir, cb) {
    dir = path.resolve(dir);

    fs.stat(dir, function (err, stat) {
        if (err || !stat.isDirectory()) {
            fs.mkdir(dir, cb);
        } else {
            cb();
        }
    });
};

