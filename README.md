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

Then write the main script

runner.js

``` js
    var Runner = require('srunner').Runner
      , runner = new Runner();

    runner
        .init({ dir: './scripts', onError: 'killServers' })
        .setupEnv()
        .startServers({ port: 9000 })
        .doSomething()
        .killServers()
        .run();
```

For another example check out [gcpk](https://github.com/gabesoft/gcpk)

# sub-scripts method signature

The sub-scripts (steps) are expected to provide a single export method with
the following signatures (any of these is allowed):

``` js
module.exports = function (state, options, cb)
```
``` js
module.exports = function (options, cb)
```
``` js
module.exports = function (cb)
```

where
- state:    Is an object that is local to the main script runner and it's passed to every step
- options:  Is used to pass any parameter from the main script (see the startServers method above)
- cb:       Is a callback method that must be called (potentially with an error). If called with an
            error all the steps following this one will be skipped and an error handler will be
            invoked if specified.

# methods

``` js
var Runner = require('srunner').Runner
  , runner = new Runner();
```

## init(options)

This method must be called first. It reads the scripts directory and creates methods on the runner
based on the scripts found in the specified directory. Each file should be named with underscores
and its corresponding method will be camel cased (e.g. do_stuff.js -> doStuff()).

## run(cb)

Will run the script. All methods will be run async and in the order called. On error (either
unhandled or not) the specified error handler will be called, if any. This function can be passed 
a callback for further processing.

```
$ npm install srunner
```

# license

MIT




