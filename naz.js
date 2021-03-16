/*
  naz.js
  interface to naz interpreter
  copyright (c) 2021 sporeball
  MIT license
*/

const Naz = require("./index.js");

const chalk = require("chalk");
const fs = require("fs");
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
  "unlimited": { aliases: "-u / --unlimited" },
  "null": { aliases: "-n / --null" }
});

function naz() {
  var {program, delay, input, unlimited} = args;
  var filename = program.slice(program.lastIndexOf("/") + 1);

  if (args["file"]) {
    try {
      input = fs.readFileSync(args["file"], {encoding: "utf-8"}, function(){});
    } catch (e) {
      runnerErr("input file not found");
    }
  }

  if (args["null"]) input += "\u0000";

  // get file contents
  // also normalizes line endings to CRLF
  try {
    var contents = eol.crlf(fs.readFileSync(program, {encoding: "utf-8"}, function(){}));
  } catch (e) {
    runnerErr("file not found");
  }

  contents = contents.split("\r\n")
    .map(x => x.match(/^\w+ +#.*$/) ? x.slice(0, x.indexOf(" #")).trimEnd() : x);

  Naz.parse(contents, filename, delay, input, unlimited, false)
    .then(result => { console.log(result); });
}

runnerErr = str => {
  Naz.log(chalk.red("error: ") + str);
  process.exit(1);
}

naz();
