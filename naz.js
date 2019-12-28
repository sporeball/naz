/*
  naz.js
  interface to naz interpreter
  copyright (c) 2019 sporeball
  MIT license
*/

const Naz = require("./index.js");

const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const eol = require("eol");

function naz() {
  var args = process.argv.slice(2);
  var file = args[0];
  var filename;

  var delay = 1;
  var input = "";

  if (file.slice(-4) != ".naz") {
    runnerErr("not a .naz file");
  }

  if (file.indexOf("/") > -1) {
    filename = file.slice(file.lastIndexOf("/") + 1, file.length);
  } else {
    filename = file;
  }

  if (args.includes("-d") || args.includes("--delay")) {
    let idx = args.findIndex(v => v === "-d" || v === "--delay");
    delay = args[idx + 1];
  }

  if (args.includes("-i") || args.includes("--input")) {
    let idx = args.findIndex(v => v === "-i" || v === "--input");
    input = args[idx + 1];
  }

  // get file contents
  // also normalizes line endings to CRLF
  var contents = eol.crlf(fs.readFileSync(path.join(__dirname, file), {encoding: "utf-8"}, function(){}));
  var code = [];
  for (var i = 0; i < contents.length; i += 2) {
    code.push(contents.substr(i, 2));
  }

  Naz.parse(code, filename, delay, input);
}

runnerErr = str => {
  Naz.log(chalk.red("error: ") + str);
  process.exit(1);
}

naz();
