var srunner = require('../index');

srunner
   .init({ dir: __dirname, onError: 'killServers' })
   .setupEnv()
   .startServers({ port1: 8000, port2: 8001 })
   .doSomething({ change: 'world' })
   .killServers()
   .run();
