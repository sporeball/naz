/*
  index.js
  naz interpreter
  copyright (c) 2020 sporeball
  MIT license
*/

// dependencies
const chalk = require("chalk");
const perf = require("execution-time")();
const ms = require("pretty-ms");

// spinner code
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

var num = 0; // number to be used for the next instruction
var fnum = 0; // number to be used when executing the f command
var vnum = 0; // number to be used when executing the v command

var jnum = 0; // number of the function to execute conditionally
var cnum = -999; // number to check against

var i = 0; // the step the interpreter is on
var line = col = 1;

var input;
var output = "";

var u;

var halt = false; // whether to halt the interpreter
var func = false; // are we in the middle of declaring a function?

function parse(code, file, delay, input, unlimited) {
  filename = file;
  input = input;
  u = unlimited;

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
      if (num == 0) {
        errTrace("division by zero");
      }
      register = register % num;
    },

    // program flow instructions
    "f": () => {
      fnum = num;
      if (opcode == 0 || opcode == 3) {
        let capturedNum = num
        if (functions[capturedNum] == "") {
          errTrace("use of undeclared function");
        }
        for (var i = 0; i < functions[capturedNum].length && !halt; i += 2) {
          let val = functions[capturedNum].substr(i, 2);
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
        if (u) {
          val = String.fromCharCode(register);
        }
        else {
          errTrace("invalid output value");
        }
      }

      output += val.repeat(num);
    },
    "v": () => {
      vnum = num;
      if (opcode == 0) {
        if (variables[vnum] == -999) {
          errTrace("use of undeclared variable");
        }
        register = variables[vnum];
      } else if (opcode == 2) {
        variables[vnum] = register;
        opcode = 0;
      } else if (opcode == 3) {
        if (variables[vnum] == -999) {
          errTrace("use of undeclared variable");
        }
        cnum = variables[vnum];
      }
    },

    // conditional instructions
    "l": () => {
      if (opcode != 3) {
        errTrace("conditionals must run in opcode 3");
      }
      jnum = num;
      chkCnum();
      opcode = 0;
      if (register < cnum) {
        conditional();
      }
    },
    "e": () => {
      if (opcode != 3) {
        errTrace("conditionals must run in opcode 3");
      }
      jnum = num;
      chkCnum();
      opcode = 0;
      if (register == cnum) {
        conditional();
      }
    },
    "g": () => {
      if (opcode != 3) {
        errTrace("conditionals must run in opcode 3");
      }
      jnum = num;
      chkCnum();
      opcode = 0;
      if (register > cnum) {
        conditional();
      }
    },

    // special instructions
    "n": () => {
      if (variables[num] == -999) {
        errTrace("use of undeclared variable")
      }
      variables[num] = -(variables[num]);
    },
    "r": () => {
      if (input == "") {
        errTrace("no input provided");
      }

      let val = input.charCodeAt(-1 + num);
      if (Number.isNaN(val)) {
        errTrace("input string not long enough")
      }

      register = val;
      input = input.replace(input.slice(num - 1, num), "");
    },
    "x": () => {
      if (num > 3) {
        errTrace("invalid opcode");
      }

      opcode = num;
    }
  }

  // all functions start undeclared
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

  // all variables start undeclared
  var variables = {
    // we can put any arbitrary default value here as long as it's unusable
    0: -999,
    1: -999,
    2: -999,
    3: -999,
    4: -999,
    5: -999,
    6: -999,
    7: -999,
    8: -999,
    9: -999
  };

  function chkRegister() {
    if (u) {
    }
    else {
      if (register < -127 || register > 127) {
        errTrace("register value out of bounds");
      }
    }
  }

  // check if we've actually set cnum
  function chkCnum() {
    if (cnum == -999) {
      errTrace("number to check against must be defined");
    }
  }

  // execute a correctly formatted conditional instruction
  function conditional() {
    num = jnum;
    instructions["f"]();
    cnum = -999; // reset cnum
  }

  function sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  // main function
  async function main() {
    spinner.start();
    perf.start();

    while (i < code.length) {
      try {
        step(i);
      } catch (e) {
        if (e instanceof RangeError) {
          errTrace("too much recursion");
        }
      }

      if (halt) break;
      await sleep(delay);
      i++;
    }

    // stop
    const results = perf.stop();
    const time = ms(Number(results.time.toFixed(0)));

    spinner.stop();

    log(chalk.green("finished") + chalk.cyan(` in ${time}`))
    log(`output: ${output}`)
    return;
  }
  main();

  function step(n) {
    // newline
    if (code[n] == "\r\n") {
      func = false;

      line++;
      col = 1;

      if (opcode == 1) { opcode = 0; }

      return;
    }

    if (code[n] == "0x") {
      func = false;
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

    // the instruction is formatted correctly, so we continue

    num = Number(code[n].slice(0, 1));
    col++;

    var instruction = code[n].slice(1, 2);
    if (!(instruction in instructions)) {
      errTrace("invalid instruction");
    }

    if (opcode == 2 && code[n].slice(1, 2) != "v") {
      errTrace("improper use of opcode 2");
    }

    if (func) { // are we in the middle of declaring a function?
      // add the parsed command to the function we're declaring
      functions[fnum] += code[n];
      return;
    }

    // everything's correct, run the instruction
    instructions[instruction]();

    col++;
  }
}

// utils
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

// exports
exports.parse = parse;
exports.log = log;
exports.warn = warn;
exports.err = err;
