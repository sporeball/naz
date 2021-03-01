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

const args = require("yeow")({
  "program": {
    type: "file",
    extensions: ".naz",
    required: true,
    missing: "a file must be passed",
    invalid: "not a .naz file"
  },
  "delay": {
    type: "number",
    aliases: "-d / --delay",
    default: 1
  },
  "file": {
    type: "file",
    aliases: "-f / --file"
  },
  "input": {
    type: "string",
    aliases: "-i / --input"
  },
  "unlimited": { aliases: "-u / --unlimited" }
});

function naz() {
  var {program, delay, input, unlimited} = args;
  var filename = program.slice(program.lastIndexOf("/") + 1);

  if (args["file"]) {
    try {
      input = fs.readFileSync(path.join(__dirname, args["file"]), {encoding: "utf-8"}, function(){});
    } catch (e) {
      runnerErr("input file not found");
    }
  }

  // get file contents
  // also normalizes line endings to CRLF
  try {
    var contents = eol.crlf(fs.readFileSync(path.join(__dirname, program), {encoding: "utf-8"}, function(){}));
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
