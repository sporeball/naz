/*
  naz.js
  interface to naz interpreter
  copyright (c) 2021 sporeball
  MIT license
*/

import parse from './index.js';

import chalk from 'chalk';
import eol from 'eol';
import fs from 'fs';
import yeow from 'yeow';

const args = yeow({
  program: {
    type: 'file',
    extensions: '.naz',
    required: true,
    missing: 'a file must be passed',
    invalid: 'not a .naz file'
  },
  file: {
    type: 'file',
    aliases: '-f / --file'
  },
  input: {
    type: 'string',
    aliases: '-i / --input'
  },
  unlimited: { aliases: '-u / --unlimited' },
  null: { aliases: '-n / --null' }
});

function naz () {
  let contents;
  let { program, input, unlimited } = args;
  const filename = program.slice(program.lastIndexOf('/') + 1);

  if (args.file) {
    try {
      input = fs.readFileSync(args.file, { encoding: 'utf-8' }, function () {});
    } catch (e) {
      runnerErr('input file not found');
    }
  }

  if (args.null) input += '\u0000';

  // get file contents
  // also normalizes line endings to CRLF
  try {
    contents = eol.crlf(fs.readFileSync(program, { encoding: 'utf-8' }, function () {}));
  } catch (e) {
    runnerErr('file not found');
  }

  contents = contents.split('\r\n')
    .map(x => x.match(/^\w+ +#.*$/) ? x.slice(0, x.indexOf(' #')).trimEnd() : x);

  const tStart = performance.now();

  parse(contents, filename, input, unlimited, false)
    .then(result => {
      const tEnd = performance.now();
      const time = (tEnd - tStart).toFixed(0);

      console.log(chalk`{green finished} {cyan in ${time}ms}`);
      console.log(result);
    });
}

const runnerErr = str => {
  Naz.log(chalk.red('error: ') + str);
  process.exit(1);
};

naz();
