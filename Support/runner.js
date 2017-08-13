const { execFile, exec } = require('child_process');

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
  return {
    PATH: getPath(),
  };
}

function shouldIgnore(message) {
  return IGNORE_PATTERN.test(message.message);
}

function updateGutterMarks(result) {
  const args = result.messages.reduce((a, message) => {
    if (!shouldIgnore(message)) {
      return a.concat([
        `--set-mark='${SEVERITIES[message.severity]}:[ESLint] ${message.message} (${message.ruleId})'`,
        `--line=${message.line}:${message.column}`
      ]);
    }
  }, ['--clear-mark=warning', '--clear-mark=error']);
  exec(`${process.env.TM_MATE} ${args.join(' ')} '${result.filePath}'`);
}

function clearGutterMarks() {
  execFile(process.env.TM_MATE, ['--clear-mark=warning', '--clear-mark=error', process.env.TM_FILEPATH]);
}

function inflect(singular, plural, count) {
  if (count === 0 || count > 1) {
    return plural;
  }
  return singular;
}

function printSummary(result) {
  if (result.errorCount || result.warningCount) {
    if (result.errorCount) {
      console.log(
        `${result.errorCount} ${inflect('error', 'errors', result.errorCount)}`
      );
    }
    if (result.warningCount) {
      console.log(
        `${result.warningCount} ${inflect('warning', 'warnings', result.warningCount)}`
      );
    }
    console.log('\rPress Shift-Ctrl-V to view the full report.');
  }
}

function run(callback) {
  const eslint = process.env.TM_JAVASCRIPT_ESLINT_ESLINT || 'eslint';

  execFile(eslint, ['-f', 'json', '--no-color', process.env.TM_FILEPATH], {
    cwd: getCwd(),
    env: getEnv(),
  }, (err, stdout, stderr) => {
    const results = JSON.parse(stdout);
    callback(results[0]);
  });
}

if (require.main === module) {
  run(result => {
    if (result) {
      updateGutterMarks(result);
    } else {
      clearGutterMarks();
    }
  });
}
