'use strict';
const Queue = require('bull');

const queue = new Queue('my-queue');

queue.on('waiting', jobId => console.log('Job waiting', jobId));
queue.on('error', error => console.error('Queue Error', error));

if (!process.env.NO_PROCESS) {
  queue.process(job => {
    console.log('processing job', job.id);
  });
}

queue.add({some: 'data'});

process.on('unhandledRejection', error => {
  console.error('Unhandled Rejection', error);
  process.exit(1);
});

