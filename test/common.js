import parse from '../index.js';

import chalk from 'chalk';
import eol from 'eol';
import fs from 'fs';
import path from 'path';

let contents;

export function test (file, input, expected) {
  return new Promise(function(resolve, reject) {
    contents = eol.crlf(fs.readFileSync(path.join(path.resolve(), `examples/${file}.naz`), {encoding: "utf-8"}, function(){}));

    contents = contents.split("\r\n")
      .map(line => line.replace(/^#.*$| +#.*$/gm, ''));

    parse(contents, "", input, false, true).then(function(output) {
      if (output.indexOf(`${chalk.red("error:")}`) == 0) {
        reject(new Error(output));
      }
      output = output.slice(8);
      if (output != expected) {
        reject(new Error(`${chalk.red("error:")} output was ${output}, expected ${expected}`));
      } else {
        resolve();
      }
    });
  }).catch();
}
