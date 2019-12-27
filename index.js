/*
  index.js
  naz interpreter
  copyright (c) 2019 sporeball
  MIT license
*/

const chalk = require("chalk");
const perf = require("execution-time")();
const ms = require("pretty-ms");

const ora = require("ora");
const spinner = ora("running...")
spinner.color = "yellow";
spinner.spinner = {
  "interval": 80,
  "frames": ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
}

var filename;

var opcode = 0;
var register = 0;
var num = 0;
var fnum = 0;
var line = col = 1;

var output = ""; // output

var halt = false; // halt flag
var func = false; // function flag

function parse(code, file, delay) {
  filename = file;

  var instructions = {
    // arithmetic instructions
    "a": () => {
      register += num;
      chkRegister();
    },
    "d": () => {
      if (num == 0) {
        errTrace("division by zero");
      }
      register = Math.floor(register / num);
    },
    "m": () => {
      register *= num;
      chkRegister();
    },
    "s": () => {
      register -= num;
      chkRegister();
    },
    "p": () => {
      register = register % num;
    },

    // program flow instructions
    "f": () => {
      fnum = num;
      if (opcode == 0) {
        if (functions[fnum] == "") {
          errTrace("use of undeclared function");
        }
        for (var i = 0; i < functions[fnum].length; i += 2) {
          let val = functions[fnum].substr(i, 2);
          num = Number(val.slice(0, 1));
          let instruction = val.slice(1, 2);
          instructions[instruction]();
        }
      } else if (opcode == 1) {
        func = true;
      }
    },
    "h": () => {
      warn("program halted.");
      trace();
      halt = true;
    },
    "o": () => {
      let val;
      if (register > -1 && register < 10) {
        val = register.toString();
      } else if (register == 10) {
        val = "\n";
      } else if (register > 31 && register < 127) {
        val = String.fromCharCode(register);
      } else {
        errTrace("invalid output value");
      }

      for (let i = 0; i < num; i++) {
        output += val;
      }
    },

    // special instructions
    "x": () => {
      if (num > 1) {
        errTrace("invalid opcode");
      }

      opcode = num;
    }
  }

  var functions = {
    0: "",
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
    8: "",
    9: ""
  };

  // var fs_declared = {
  //   0: false,
  //   1: false,
  //   2: false,
  //   3: false,
  //   4: false,
  //   5: false,
  //   6: false,
  //   7: false,
  //   8: false,
  //   9: false
  // };

  function chkRegister() {
    if (register < -127 || register > 127) {
      errTrace("register value out of bounds");
    }
  }

  function sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  var i = 0;
  async function main() {
    spinner.start();
    perf.start();

    while (i < code.length) {
      step(i);
      if (halt) break;
      await sleep(delay);
      i++;
    }

    const results = perf.stop();
    const time = ms(Number(results.time.toFixed(0)));

    spinner.stop();

    log(chalk.green("finished") + chalk.cyan(` in ${time}`))
    log(`output: ${output}`)
    return;
  }
  main();

  function step(n) {
    if (code[n] == "\r\n") {
      func = false;

      line++;
      col = 1;

      if (opcode == 1) { opcode = 0; }

      return;
    }

    if (isNaN(code[n].slice(0, 1))) {
      if (!(code[n].slice(0, 1) in instructions)) {
        errTrace("invalid instruction");
      }
      errTrace("missing number literal");
    } else {
      if (code[n].slice(1, 2) == "\r") {
        errTrace("number literal missing an instruction");
      }
    }

    if (!isNaN(code[n].slice(1, 2))) {
      errTrace("attempt to chain number literals");
    }

    if (func) {
      functions[fnum] += code[n];
      return;
    }

    num = Number(code[n].slice(0, 1));
    col++;

    var instruction = code[n].slice(1, 2);
    if (!(instruction in instructions)) {
      errTrace("invalid instruction");
    }

    instructions[instruction]();

    col++;
  }
}

log = str => { console.log(chalk.white(str)) }
info = str => { log(chalk.cyan(str)) }
success = str => { log(chalk.green(str)) }
warn = str => { log(chalk.yellow(str)) }

err = str => {
  spinner.stop();
  perf.stop();
  log(chalk.red("error: ") + str);
  halt = true;
}

errTrace = str => {
  err(str);
  trace();
  process.exit(1);
}

trace = () => { info(`  at ${filename}:${line}:${col}`); }

exports.parse = parse;
exports.log = log;
exports.warn = warn;
exports.err = err;
