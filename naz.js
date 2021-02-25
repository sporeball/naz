/*
  naz.js
  interface to naz interpreter
  copyright (c) 2021 sporeball
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
  var input;

  var unlimited = false;

  if (file === undefined) {
    runnerErr("a file must be passed");
  }

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

  if (args.includes("-f") || args.includes("--file")) {
    let idx = args.findIndex(v => v === "-f" || v === "--file");
    try {
      input = fs.readFileSync(path.join(__dirname, args[idx + 1]), {encoding: "utf-8"}, function(){});
    } catch (e) {
      runnerErr("input file not found");
    }
  }

  if (args.includes("-u") || args.includes("--unlimited")) {
    unlimited = true;
  }

  // get file contents
  // also normalizes line endings to CRLF
  try {
    var contents = eol.crlf(fs.readFileSync(path.join(__dirname, file), {encoding: "utf-8"}, function(){}));
  } catch (e) {
    runnerErr("file not found");
  }

  // filter comments from file
  contents = contents.split("\r\n")
    .filter(x => x.charAt(0) != "#") // full line
    .map(x => x.indexOf(" #") > -1 ? x.slice(0, x.indexOf(" #")) : x) // partial line
    .map(x => x.trimEnd())
    .join("\r\n");

  var code = [];
  for (var i = 0; i < contents.length; i += 2) {
    code.push(contents.substr(i, 2));
  }

  Naz.parse(code, filename, delay, input, unlimited, false);
}

runnerErr = str => {
  Naz.log(chalk.red("error: ") + str);
  process.exit(1);
}

naz();
