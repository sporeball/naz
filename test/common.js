const Naz = require("../index.js");
const chalk = require("chalk");

var code = [];

function parse(contents, input, expected) {
  return new Promise(function(resolve, reject) {
    code = [];
    for (var i = 0; i < contents.length; i += 2) {
      code.push(contents.substr(i, 2));
    }

    Naz.parse(code, "", 1, input, false, true).then(function(output) {
      setTimeout(function() {
        if (output.indexOf(`${chalk.red("error:")}`) == 0) {
          reject(new Error(output));
        }
        output = output.slice(8);
        if (output != expected) {
          reject(new Error(`${chalk.red("error:")} output was ${output}, expected ${expected}`));
        } else {
          resolve();
        }
      }, 200);
    });
  }).catch();
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

exports.parse = parse;
exports.sleep = sleep;
