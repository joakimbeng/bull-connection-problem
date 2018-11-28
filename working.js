'use strict';
const queueUtils = require('bull/lib/utils');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const originalIsRedisReady = queueUtils.isRedisReady;
queueUtils.isRedisReady = async client => {
  while (true) {
    try {
      return await originalIsRedisReady(client);
    } catch (error) {
      await sleep(1000);
    }
  }
}

require('.');

