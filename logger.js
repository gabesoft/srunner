var util   = require('util')
  , core   = require('./core')
  , colors = require('colors')
  , levels = {
        error : { text: 'error'.red,          pad: '  ' }
      , debug : { text: 'debug'.grey.inverse, pad: '  ' }
      , info  : { text: 'info'.blue,          pad: '   ' }
      , warn  : { text: 'warn'.yellow,        pad: '   ' }
      , help  : { text: 'help'.cyan,          pad: '   ' }
      , step  : { text: 'step'.magenta,       pad: '   ' }
      , data  : { text: 'data'.grey,          pad: '   ' }
    };

function enabled (name) {
    var env = process.env.NODE_ENV;
    return name !== 'debug' || (env === 'debug' || env === 'development');
}

function Logger (options) {
    var self = this;

    self.options = options || {};

    Object.keys(levels).forEach(function(name) {
        self[name] = function(obj) {
            if (enabled(name)) {
                self.write(levels[name], obj);
            }
        };
    });
}

Logger.prototype.writeln = function(level, obj) {
    obj = obj || '';
    console.log(level.text + ':' + level.pad, obj);
};


Logger.prototype.write = function(level, obj) {
    obj = obj || '';

    var self  = this
      , opts  = this.options
      , lines = null;

    if (core.isString(obj)) {
        lines = obj.split('\n');
        if (!opts.keepBlankLines) {
            lines = lines.filter(Boolean);
        }
        lines.forEach(function (line) {
            self.writeln(level, line);
        });
    } else if (Buffer.isBuffer(obj)) {
        self.write(level, obj.toString('utf8').trim());
    } else if (util.isError(obj) && obj.stack) {
        self.write(level, obj.stack);
    } else {
        self.writeln(level, obj);
    }
}

module.exports.Logger = Logger;
