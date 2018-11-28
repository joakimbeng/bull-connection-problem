# bull-connection-problem

This repository aims to reproduce a problem with unhandled rejected promises in [Bull](https://github.com/OptimalBits/bull).

The problem occurs when a Redis server is down at the moment, e.g. when an `ECONNREFUSED` error is thrown when trying to connect.

## Steps to reproduce:

```
npm install

node index.js
```

This will log the unhandled rejection and exit with status `1`.

**Note:** the problem only occurs if `queue.process` is called (which it usually is).  
To show that it doesn't exit when the process function isn't called you can run the script with: `NO_PROCESS=1 node index.js`

When having a Redis instance up and running the problem does not occur, which you can verify by running:

```
docker-compose up -d

node index.js
```

## Potential solution:

I've tracked down the issue to the `isRedisReady` function in `bull/lib/utils.js` because everywhere it's used any error is not handled.

With a quite naive approach of retrying the internal `isRedisReady` function indefinitely like this:

```js
const queueUtils = require('bull/lib/utils')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const originalIsRedisReady = queueUtils.isRedisReady
queueUtils.isRedisReady = async client => {
  while (true) {
    try {
      return await originalIsRedisReady(client)
    } catch (error) {
      await sleep(1000)
    }
  }
}
```

You won't run into the problem.

To verify this you can run: `node working.js`

