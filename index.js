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
const fs = require("fs");

// spinner code
const ora = require("ora");
const spinner = ora("running...")
spinner.color = "yellow";
spinner.spinner = {
  "interval": 80,
  "frames": ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
}

var code;
var filename;
var delay;

var opcode = 0;
var register = 0;

var num = 0; // number to be used for the next instruction
var fnum = 0; // number to be used when executing the f command
var vnum = 0; // number to be used when executing the v command

var jnum = 0; // number of the function to execute conditionally
var cnum = undefined; // number to check against

var i = 0; // the step the interpreter is on
var line = col = 1;

var input;
var output = "";

var error;

var u;

var halt = false; // whether to halt the interpreter
var func = false; // are we in the middle of declaring a function?
var test = false; // are we running a test right now?

var instructions = {
  // arithmetic instructions
  "a": () => {
    register += num;
    chkRegister();
  },
  "d": () => {
    if (num == 0) {
      throw new Error("division by zero");
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
      throw new Error("division by zero");
    }
    register = register % num;
  },

  // program flow instructions
  "f": () => {
    fnum = num;
    if (opcode == 0 || opcode == 3) {
      if (functions[fnum] == "") {
        throw new Error("use of undeclared function");
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
    spinner.stop();
    warn("program halted");
    info(`  at ${filename}:${line}:${col}`);
    if (!test) log(`output: ${output}`)
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
        throw new Error("invalid output value");
      }
    }

    output += val.repeat(num);
  },
  "v": () => {
    vnum = num;
    if (opcode == 0) {
      if (variables[vnum] === undefined) {
        throw new Error("use of undeclared variable");
      }
      register = variables[vnum];
    } else if (opcode == 2) {
      variables[vnum] = register;
      opcode = 0;
    } else if (opcode == 3) {
      if (variables[vnum] === undefined) {
        throw new Error("use of undeclared variable");
      }
      cnum = variables[vnum];
    }
  },

  // conditional instructions
  "l": () => {
    if (opcode != 3) {
      throw new Error("conditionals must run in opcode 3");
    }
    jnum = num;
    chkCnum();
    if (register < cnum) {
      conditional();
    }
  },
  "e": () => {
    if (opcode != 3) {
      throw new Error("conditionals must run in opcode 3");
    }
    jnum = num;
    chkCnum();
    if (register == cnum) {
      conditional();
    }
  },
  "g": () => {
    if (opcode != 3) {
      throw new Error("conditionals must run in opcode 3");
    }
    jnum = num;
    chkCnum();
    if (register > cnum) {
      conditional();
    }
  },

  // special instructions
  "n": () => {
    if (variables[num] == -999) {
      throw new Error("use of undeclared variable")
    }
    variables[num] = -(variables[num]);
  },
  "r": () => {
    if (input == "") {
      throw new Error("no input provided");
    }

    let val = input.charCodeAt(-1 + num);
    if (Number.isNaN(val)) {
      throw new Error("input string not long enough")
    }

    register = val;
    input = input.replace(input.slice(num - 1, num), "");
  },
  "x": () => {
    if (num > 3) {
      throw new Error("invalid opcode");
    }

    opcode = num;
  }
};

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
var variables = {};

function chkRegister() {
  if (u) {
  }
  else {
    if (register < -127 || register > 127) {
      throw new Error("register value out of bounds");
    }
  }
}

// check if we've actually set cnum
function chkCnum() {
  if (cnum === undefined) {
    throw new Error("number to check against must be defined");
  }
}

// execute a correctly formatted conditional instruction
function conditional() {
  opcode = 0;
  num = jnum;
  instructions["f"]();
  cnum = undefined; // reset cnum
}

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
      throw new Error("invalid instruction");
    }
    throw new Error("missing number literal");
  } else {
    if (code[n].slice(1, 2) == "\r") {
      throw new Error("number literal missing an instruction");
    }
  }

  if (!isNaN(code[n].slice(1, 2))) {
    throw new Error("attempt to chain number literals");
  }

  // the instruction is formatted correctly, so we continue

  num = Number(code[n].slice(0, 1));
  col++;

  var instruction = code[n].slice(1, 2);
  if (!(instruction in instructions)) {
    throw new Error("invalid instruction");
  }

  if (opcode == 2 && code[n].slice(1, 2) != "v") {
    throw new Error("improper use of opcode 2");
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

async function parse(c, file, d, inp, unlimited, t) {
  code = c;
  filename = file;
  delay = d;
  input = inp;
  u = unlimited;
  test = t;

  spinner.start();
  perf.start();

  while (i < code.length) {
    try {
      step(i);
    } catch (e) {
      if (e instanceof RangeError) {
        error = new Error("too much recursion");
      } else {
        error = e;
      }
      spinner.stop();
      perf.stop();
      if (!test) {
        log(chalk.red("error: ") + error.message);
        info(`  at ${filename}:${line}:${col}`);
      }
      return `${chalk.red("error:")} ${error.message}\n${chalk.cyan(`      at ${line}:${col}`)}`;
    }

    await sleep(delay);
    i++;
  }

  // stop
  const results = perf.stop();
  const time = ms(Number(results.time.toFixed(0)));

  spinner.stop();

  if (halt) {
    return error;
  }

  if (!halt && !test) log(chalk.green("finished") + chalk.cyan(` in ${time}`));
  if (!test) log(`output: ${output}`)

  if (test) fs.writeFileSync("output.txt", output, {encoding: "utf-8"}, function(){});
  return `output: ${output}`;
}

// utils
reset = () => {
  filename = cnum = input = u = undefined;
  opcode = register = num = fnum = vnum = jnum = i = 0;
  line = col = 1;
  output = "";
  halt = func = false;
  functions = {
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
  variables = {
    0: undefined,
    1: undefined,
    2: undefined,
    3: undefined,
    4: undefined,
    5: undefined,
    6: undefined,
    7: undefined,
    8: undefined,
    9: undefined
  };
}

log = str => { console.log(chalk.white(str)) }
info = str => { log(chalk.cyan(str)) }
success = str => { log(chalk.green(str)) }
warn = str => { log(chalk.yellow(str)) }

err = str => {
  error = str;
  spinner.stop();
  perf.stop();
  log(chalk.red("error: ") + str);
  halt = true;
}

// trace = () => {
//   info(`  at ${filename}:${line}:${col}`);
// }

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

// exports
exports.parse = parse;
exports.reset = reset;
exports.log = log;
exports.warn = warn;
exports.err = err;
