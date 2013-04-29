var async = require('async')
  , fs    = require('fs')
  , util  = require('util')
  , path  = require('path');

require('colors');

function readFiles (dir) {
    return fs
       .readdirSync(dir)
       .map(function(name) { return path.join(dir, name); });
}

function getKey (text) {
    text = text.replace(/\.[a-z]+$/, '');
    return text.replace(/_(.)/g, function (x, chr) { return chr.toUpperCase(); });
}

function getDesc (text) {
    text = text.replace(/\.[a-z]+$/, '');
    text = text.replace(/_(.)/g, function (x, chr) { return ' ' + chr.toUpperCase(); });
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function callStep (fn, state, options, cb) {
    var arity = fn.length;

    switch (arity) {
        case 3:
            fn(state, options, cb);
            break;
        case 2:
            fn(options, cb);
            break;
        default:
            fn(cb);
            break;
    }
}

function Runner () {
    if (!(this instanceof Runner)) { return new Runner(); }

    this._errorHandler = null;
    this._steps        = null;
    this._state        = null;
    this._quiet        = false;
}

Runner.prototype.init = function(options) {
    options    = options || {};

    var self  = this
      , dirs  = []
      , dir   = options.dir || options.scripts || options.scriptDir || __dirname
      , files = null;

    dirs.push(path.join(__dirname, 'scripts'));

    dir   = util.isArray(dir) ? dir : [ dir ]
    dirs  = dirs.concat(dir);
    files = dirs.reduce(function (acc, d) { return acc.concat(readFiles(d)); }, []);

    self._quiet = options.quiet;
    self._steps = [];

    files.forEach(function (file) {
        var name = path.basename(file)
          , key  = getKey(name);

        if (options.onError && key === options.onError) {
            self._errorHandler = function (err, cb) {
                var handler = require(file);
                callStep(handler, self._state, { error: err }, cb);
            }
        }

        self[key] = function (stepOptions) {
            self._steps.push(function (state, cb) {
                var desc = getDesc(name)
                  , step = require(file)
                  , opts = stepOptions || {};

                self._printStepName(desc);
                callStep(step, state, opts, function (err) {
                    cb(err, state);
                });
            });

            return self;
        };
    });

    if (self._errorHandler) {
        process.on('uncaughtException', function (err) {
            self._errorHandler(err, function () {
                console.error(err.stack || err);
                process.exit(1);
            });
        });
    } else if (options.onError) {
        console.log('No error handler found '.yellow + options.onError);
    }

    self._state     = options.state || {};
    self._state.log = require('./logger');
    return self;
};

Runner.prototype.run = function(cb) {
    var self  = this
      , tasks = self._steps.slice(0)
      , cb    = cb || function (err) {
            if (err && self._errorHandler) {
                self._errorHandler(err, function () { self._printStatusAndExit(err); });
            } else {
                self._printStatusAndExit(err);
            }
        };

    tasks.unshift(function (cb) {
        self._printStepName('Runner Started');
        cb(null, self._state);
    });

    async.waterfall(tasks, cb);
};

Runner.prototype._printStepName = function(step) {
    if (!this._quiet) {
        console.log(step.blue);
    }
};

Runner.prototype._printStatusAndExit = function(err) {
    if (err) {
        if (this._state.log) {
            this._state.log.error(err);
        } else {
            console.log('Runner Failed'.red, err);
        }
    } else if (!this._quiet) {
        this._printStepName('Runner Done');
    }

    if (this._state.exitCode) {
        process.exit(this._state.exitCode);
    } else {
        process.exit(err ? 1 : 0);
    }
};

module.exports.Runner = Runner;
module.exports.create = function() { return new Runner(); };
