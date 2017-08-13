const fs = require('fs');
const { execFile, spawn, exec } = require('child_process');
// const execFile = require('child_process').execFile;

const IGNORE_PATTERN = /^File ignored because of a matching ignore pattern/;

const SEVERITY_WARNING = 1;
const SEVERITY_ERROR = 2;
const SEVERITIES = {
  [SEVERITY_ERROR]: 'error',
  [SEVERITY_WARNING]: 'warning',
};

function getCwd() {
  if (process.env.TM_PROJECT_DIRECTORY) {
    return process.env.TM_PROJECT_DIRECTORY;
  }
  return process.env.TM_DIRECTORY;
}

function getPath() {
  return `${getCwd()}/node_modules/.bin:${process.env.PATH}`;
}

function getEnv() {
  return Object.assign({}, process.env, {
    PATH: getPath(),
  });
}

const log = fs.openSync('./out.log', 'a');

spawn('node', ['./runner.js'], {
  detached: true,
  stdio: ['ignore', log, log],
  env: getEnv(),
  cwd: __dirname,
}).unref();
