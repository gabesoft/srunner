var Runner = require('../index').Runner
  , runner = new Runner({ name : 'sample runner' });

runner
   .init({ dir: __dirname, onError: 'killServers', logRunnerId: true })
   .setupEnv()
   .startServers({ port1: 8000, port2: 8001 })
   .doSomething({ change: 'world' })
   .killServers()
   .repeat({ repeatCount : 3 })
   .run();
