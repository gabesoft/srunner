var util   = require('util')
  , core   = require('./core')
  , colors = require('colors')
  , levels = {
        error : { text: 'error'.red,          pad: '  ' }
      , debug : { text: 'debug'.grey.inverse, pad: '  ' }
      , info  : { text: 'info'.blue,          pad: '   ' }
      , warn  : { text: 'warn'.yellow,        pad: '   ' }
      , help  : { text: 'help'.cyan,          pad: '   ' }
      , data  : { text: 'data'.grey,          pad: '   ' }
    };

function writeln(level, obj) {
    obj = obj || '';
    console.log(level.text + ':' + level.pad, obj);
}

function write (level, obj) {
    obj = obj || '';
    if (core.isString(obj)) {
        obj.split('\n').filter(Boolean).forEach(function (line) {
            writeln(level, line);
        });
    } else if (Buffer.isBuffer(obj)) {
        write(level, obj.toString('utf8').trim());
    } else if (util.isError(obj) && obj.stack) {
        write(level, obj.stack);
    } else {
        writeln(level, obj);
    }
}

function enabled (name) {
    var env = process.env.NODE_ENV;
    return name !== 'debug' || (env === 'debug' || env === 'development');
}

Object.keys(levels).forEach(function(name) {
    module.exports[name] = function(obj) {
        if (enabled(name)) {
            write(levels[name], obj);
        }
    };
});
