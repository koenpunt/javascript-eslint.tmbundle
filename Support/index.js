const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

const log = fs.openSync(path.join(__dirname, 'runner.log'), 'a');

spawn('node', ['./runner.js'], {
  detached: true,
  stdio: ['ignore', log, log],
  env: process.env,
  cwd: __dirname,
}).unref();
