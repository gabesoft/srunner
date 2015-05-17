var async  = require('async')
  , fs     = require('fs')
  , util   = require('util')
  , path   = require('path')
  , id     = 1
  , Logger = require('./logger').Logger;

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
    return text.toLowerCase();
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

function Runner (options) {
    if (!(this instanceof Runner)) { return new Runner(options); }

    options = options || {};

    this.log            = options.log || new Logger(options);
    this._ignoreResults = Boolean(options.ignoreResults);
    this._quiet         = Boolean(options.quiet);
    this._logRunnerId   = Boolean(options.logRunnerId);
    this._errorHandler  = null;
    this._steps         = null;
    this._state         = null;
    this._dir           = options.dir || options.scripts || options.scriptDir || __dirname;
    this._id            = id++;
}

Runner.prototype.init = function(options) {
    options    = options || {};

    var self  = this
      , dirs  = []
      , dir   = options.dir || options.scripts || options.scriptDir || self._dir
      , files = null;

    dirs.push(path.join(__dirname, 'scripts'));

    dir   = util.isArray(dir) ? dir : [ dir ];
    dirs  = dirs.concat(dir);
    files = dirs.reduce(function (acc, d) { return acc.concat(readFiles(d)); }, []);

    self._quiet         = Boolean(options.quiet) || self._quiet;
    self._ignoreResults = Boolean(options.ignoreResults) || self._ignoreResults;
    self._logRunnerId   = Boolean(options.logRunnerId) || self._logRunnerId;
    self._steps         = [];

    files.forEach(function (file) {
        var name = path.basename(file)
          , key  = getKey(name);

        if (options.onError && key === options.onError) {
            self._errorHandler = function (err, cb) {
                var handler = require(file);
                callStep(handler, self._state, { error: err }, cb);
            };
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
    self._state.log = self.log;
    return self;
};

Runner.prototype.run = function(callback) {
    var self  = this
      , tasks = self._steps.slice(0)
      , cb    = callback || function (err) {
            if (err && self._errorHandler) {
                self._errorHandler(err, function () { self._printStatusAndExit(err); });
            } else {
                self._printStatusAndExit(err);
            }
        };

    tasks.unshift(function (cb) {
        self._printStepName('runner started');
        self._state.runner = self;
        cb(null, self._state);
    });

    async.waterfall(tasks, function (err, results) {
        if (self._ignoreResults) {
            cb(err);
        } else {
            cb(err, results);
        }
    });
};

Runner.prototype._printStepName = function(step) {
    var runnerString = this._logRunnerId
            ? ('runner ' + this._id).magenta + ' '
            : '';
    if (!this._quiet) {
        if (this._state.log && this._state.log.step) {
            this._state.log.step(runnerString + step);
        } else {
            console.log(step.blue);
        }
    }
};

Runner.prototype._printStatusAndExit = function(err) {
    if (err) {
        if (this._state.log) {
            this._state.log.error(err);
        } else {
            console.log('runner failed'.red, err);
        }
    } else if (!this._quiet) {
        this._printStepName('runner done');
    }

    if (this._state.exitCode) {
        process.exit(this._state.exitCode);
    } else {
        process.exit(err ? 1 : 0);
    }
};

module.exports.Runner = Runner;
module.exports.Logger = Logger;
module.exports.create = function(options) { return new Runner(options); };
