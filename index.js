var async        = require('async')
  , fs           = require('fs')
  , path         = require('path')
  , errorHandler = null
  , steps        = null
  , state        = null;

require('colors');

function getKey (text) {
    text = text.replace(/\.[a-z]+$/, '');
    return text.replace(/_(.)/g, function (x, chr) { return chr.toUpperCase(); });
} 

function getDesc (text) {
    text = text.replace(/\.[a-z]+$/, '');
    text = text.replace(/_(.)/g, function (x, chr) { return ' ' + chr.toUpperCase(); });
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function done (err) {
    if (err) {
        console.log('Runner Failed'.red);
    } else {
        console.log('Runner Done'.blue);
    }

    if (state.exitCode) {
        process.exit(state.exitCode);
    } else {
        process.exit(err ? 1 : 0);
    }
}

function readFiles (dir) {
    return fs
       .readdirSync(dir)
       .map(function(name) { return path.join(dir, name); });
}

module.exports.init = function (options) {
    options = options || {};

    var local = path.join(__dirname, 'scripts')
      , dir   = options.dir || __dirname
      , files = null
      , print = function (step) {
            if (!options.quiet) {
                console.log('Step: ' + step.blue);
            }
        };

    files = readFiles(local);
    files = files.concat(readFiles(dir));
    steps = [];

    files.forEach(function (file) {
        var name = path.basename(file)
          , key  = getKey(name);

        if (options.onError && key === options.onError) {
            errorHandler = function (err, cb) {
                require(file)(state, { error: err }, cb);
            }
        }

        module.exports[key] = function (stepOptions) {
            steps.push(function (state, cb) {
                var desc     = getDesc(name)
                  , step     = require(file)
                  , opts     = stepOptions || {}
                  , arity    = step.length
                  , callback = function (err) {
                        cb(err, state);
                    };

                print(desc);

                switch (arity) {
                    case 3:
                        step(state, opts, callback);
                        break;
                    case 2:
                        step(opts, callback);
                        break;
                    default:
                        step(callback);
                        break;
                }
            });

            return module.exports;
        };

        if (errorHandler) {
            process.on('uncaughtException', function (err) {
                errorHandler(err, function () {
                    console.error(err.stack || err);
                    process.exit(1);
                });
            });
        }

    });

    return module.exports;
};

module.exports.run = function () {
    var tasks = steps.slice(0);

    state = {};

    tasks.unshift(function (cb) {
        console.log('Runner Started'.blue);
        cb(null, state);
    });

    async.waterfall(tasks, function (err) {
        if (err && errorHandler) {
            errorHandler(err, function () {
                done(err);
            });
        } else {
            done(err);
        }
    });
};
