# Script Runner (srunner)

*Break down large scripts into manageable steps*

# example

First create some script steps in some folder

scripts/setup_env.js

``` js
module.exports = (state, options, cb) {
    // TODO: setup environment
    cb();
};
```

scripts/start_servers.js

``` js
module.exports = (state, options, cb) {
    // TODO: start app servers
    cb();
};
```

scripts/do_something.js

``` js
module.exports = (state, options, cb) {
    // TODO: do something
    cb();
};
```

scripts/kill_servers.js

``` js
module.exports = (state, options, cb) {
    // TODO: kill servers
    cb();
};
```

scripts/cleanup.js

``` js
module.exports = (state, options, cb) {
    // TODO: perform cleanup
    cb();
};
```

Then write the main script

runner.js

``` js
    var srunner = require('srunner');

    srunner
        .init({ dir: './scripts', onError: 'cleanup' })
        .setupEnv()
        .startServers({ port: 9000 })
        .doSomething()
        .killServers()
        .cleanup()
        .run();
```

# sub-scripts method signature

the sub-scripts (steps) are expected to provide a single export method with
the following signatures (any of these is allowed)

module.exports = (state, options, cb)
module.exports = (options, cb)
module.exports = (cb)

where
- state:    Is an object that is local to the main script runner and it's passed to every step
- options:  Is used to pass any parameter from the main script (see the startServers method above)
- cb:       Is a callback method that must be called (potentially with an error). If called with an
            error all the steps following this one will be skipped and an error handler will be
            invoked if specified.

# methods

``` js
var srunner = require('srunner');
```

## init(options)

This method must be called first. It reads the scripts directory and creates methods on the runner
based on the scripts found in the specified directory. The files should be named with underscores
and corresponding methods will be camel cased (e.g. do_stuff.js -> doStuff())

## run()

Will run the script. All methods will be run async and in the order called. On error (either
unhandled or not) the specified error handler will be called, if any.

```
$ npm install srunner
```

# license

MIT




