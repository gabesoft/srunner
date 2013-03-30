var async        = require('async')
  , fs           = require('fs')
  , path         = require('path')
  , errorHandler = null
  , steps        = null
  , state        = null
  , quiet        = false
  , print        = function (step) {
        if (!quiet) {
            console.log(step.blue);
        }
    };

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
        console.log('Runner Failed'.red, err);
    } else {
        print('Runner Done');
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

module.exports.init = function (options) {
    options = options || {};
    quiet   = options.quiet;

    var local = path.join(__dirname, 'scripts')
      , dir   = options.dir || options.scripts || options.scriptDir || __dirname
      , files = null;

    files = readFiles(local);
    files = files.concat(readFiles(dir));
    steps = [];

    files.forEach(function (file) {
        var name = path.basename(file)
          , key  = getKey(name);

        if (options.onError && key === options.onError) {
            errorHandler = function (err, cb) {
                var handler = require(file);
                callStep(handler, state, { error: err }, cb);
            }
        }

        module.exports[key] = function (stepOptions) {
            steps.push(function (state, cb) {
                var desc = getDesc(name)
                  , step = require(file)
                  , opts = stepOptions || {};

                print(desc);
                callStep(step, state, opts, function (err) {
                    cb(err, state);
                });
            });

            return module.exports;
        };
    });

    if (errorHandler) {
        process.on('uncaughtException', function (err) {
            errorHandler(err, function () {
                console.error(err.stack || err);
                process.exit(1);
            });
        });
    } else if (options.onError) { 
        console.log('No error handler found '.yellow + options.onError);
    }

    return module.exports;
};

module.exports.run = function (cb) {
    var tasks = steps.slice(0)
      , cb    = cb || function (err) {
            if (err && errorHandler) {
                errorHandler(err, function () {
                    done(err);
                });
            } else {
                done(err);
            }
        };

    state = {};

    tasks.unshift(function (cb) {
        print('Runner Started');
        cb(null, state);
    });

    async.waterfall(tasks, cb);
};
