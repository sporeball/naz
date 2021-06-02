/*
  index.js
  naz interpreter
  copyright (c) 2021 sporeball & contributors:
    - tobiasheineken
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

let contents;
let filename;

let opcode = 0;
let register = 0;

let num = 0; // number to be used for the next instruction
let fnum = 0; // number to be used when executing the f instruction

let jnum = 0; // number of the function to execute conditionally
let cnum = undefined; // number to check against

let line = 1;
let col = 1;

let input;
let output = "";

let u;

let functions = Array(10).fill("");
let variables = [];
let lines = Array(10).fill(0); // line numbers where functions are declared
let cols = Array(10).fill(0); // column numbers where functions are declared

let callStack = [];

let func = false; // are we in the middle of declaring a function?
let test = false; // are we running a test right now?

const instructions = {
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
      let capturedNum = num;
      if (functions[capturedNum] == "") {
        throw new Error("use of undeclared function");
      }

      callStack.push([fnum, line, col]);
      line = lines[fnum];
      col = cols[fnum] + 2;

      let abort = undefined;
      for (let i = 0; i < functions[capturedNum].length && !abort; i += 2) {
        let val = functions[capturedNum].substr(i, 2);
        num = Number(val.slice(0, 1));
        let instruction = val.slice(1, 2);
        abort = instructions[instruction]();
        col += 2;
      }

      let popped = callStack.pop();
      line = popped[1];
      col = popped[2];
    } else if (opcode == 1) {
      if (functions[num] != "") {
        throw new Error("attempt to redeclare function");
      }
      lines[num] = line;
      cols[num] = col;
      func = true;
    }
  },
  "h": () => {
    spinner.stop();
    warn("program halted");
    log(trace());
    if (!test) log(`output: ${output}`)
    process.exit(0);
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
    if (opcode == 0) {
      if (variables[num] === undefined) {
        throw new Error("use of undeclared variable");
      }
      register = variables[num];
    } else if (opcode == 2) {
      variables[num] = register;
      opcode = 0;
    } else if (opcode == 3) {
      if (variables[num] === undefined) {
        throw new Error("use of undeclared variable");
      }
      cnum = variables[num];
    }
  },

  // conditional instructions
  "l": () => {
    preConditional();
    if (register < cnum) {
      return conditional();
    }
  },
  "e": () => {
    preConditional();
    if (register == cnum) {
      return conditional();
    }
  },
  "g": () => {
    preConditional();
    if (register > cnum) {
      return conditional();
    }
  },

  // special instructions
  "n": () => {
    if (variables[num] === undefined) {
      throw new Error("use of undeclared variable");
    }
    variables[num] = -(variables[num]);
  },
  "r": () => {
    if (input === undefined) {
      throw new Error("no input provided");
    }

    let val = input.charCodeAt(-1 + num);
    if (Number.isNaN(val)) {
      if (num == 0) {
        throw new Error("cannot read the 0th character");
      }
      throw new Error("input string not long enough");
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

function chkRegister() {
  if (!u && (register < -127 || register > 127)) {
    throw new Error("register value out of bounds");
  }
}

function preConditional() {
  if (opcode != 3) {
    throw new Error("conditionals must run in opcode 3");
  }
  if (cnum === undefined) {
    throw new Error("number to check against must be defined");
  }
  jnum = num;
  opcode = 0;
}

// execute a correctly formatted conditional instruction
function conditional() {
  instructions["f"]();
  cnum = undefined; // reset cnum
  return true; // abort current function
}

function step() {
  // line that is only a comment
  if (contents[line - 1].match(/^ *#.*$/)) {
    line++;
    return;
  }

  let instruction = contents[line - 1].slice(col - 1, col + 1);

  if (instruction == "" || col > contents[line - 1].length) {
    func = false;

    line++;
    col = 1;

    if (opcode == 1) { opcode = 0; }

    return;
  }

  let number = instruction.slice(0, 1);
  let letter = instruction.slice(1, 2);

  // special case first
  if (number == "#") {
    throw new Error("a space is required before comments at the end of a line");
  }

  if (isNaN(number)) {
    if (!(number in instructions)) {
      throw new Error("invalid instruction");
    }
    throw new Error("missing number literal");
  } else {
    if (letter == "\r") {
      throw new Error("number literal missing an instruction");
    }
  }

  if (!isNaN(letter)) {
    throw new Error("attempt to chain number literals");
  }

  // the instruction is formatted correctly, so we continue

  num = Number(number);
  col++;

  if (!(letter in instructions)) {
    throw new Error("invalid instruction");
  }

  // we handle this as soon as possible to avoid issues
  if (instruction == "0x") {
    func = false;
    opcode = 0;
    col++;
    return;
  }

  if (opcode == 1 && func == false && letter != "f") {
    throw new Error("improper use of opcode 1");
  }

  if (opcode == 2 && letter != "v") {
    throw new Error("improper use of opcode 2");
  }

  if (opcode == 3) {
    // last instruction was 3x
    if (cnum === undefined && letter != "v") {
      throw new Error("improper use of opcode 3");
    }
    // last two instructions were 3x and [0-9]v
    if (cnum !== undefined && !(letter == "e" || letter == "g" || letter == "l")) {
      throw new Error("improper use of opcode 3");
    }
  }

  if (func) { // are we in the middle of declaring a function?
    // add the parsed instruction to the function we're declaring
    functions[fnum] += instruction;
    col++;
    return;
  }

  // everything's correct, run the instruction
  instructions[letter]();

  col++;
}

async function parse(c, file, delay, inp, unlimited, t) {
  contents = c;
  filename = file;
  input = inp;
  u = unlimited;
  test = t;

  spinner.start();
  perf.start();

  while (line <= contents.length) {
    try {
      step();
    } catch (err) {
      if (err instanceof RangeError) {
        err = new Error("too much recursion");
      }
      spinner.stop();
      perf.stop();
      err.message += `\n${trace()}`;
      return `${chalk.red("error:")} ${err.message}`;
    }

    await sleep(delay);
  }

  // stop
  const results = perf.stop();
  const time = ms(Number(results.time.toFixed(0)));

  spinner.stop();

  if (!test) {
    log(chalk.green("finished") + chalk.cyan(` in ${time}`));
  }

  return `output: ${output}`;
}

// utils
const reset = () => {
  filename = cnum = input = u = undefined;
  opcode = register = num = fnum = jnum = 0;
  line = col = 1;
  output = "";
  func = false;
  functions = Array(10).fill("");
  variables = [];
}

const log = str => { console.log(chalk.white(str)) };
const info = str => { log(chalk.cyan(str)) };
const success = str => { log(chalk.green(str)) };
const warn = str => { log(chalk.yellow(str)) };

// produce stack trace
const trace = () => {
  let f = test ? "" : `${filename}:`;
  let l, c; // line and column where the function last read from the stack trace caused a problem
  let arr = []; // array of lines to keep

  callStack.reverse();
  // if something's on the stack, the interpreter halted within a function
  // push where we are
  if (callStack.length > 0) {
    arr.push(chalk.cyan(`  at ${callStack[0][0]}f (${f}${line}:${col})\n`));
  }

  // every item on the stack is an array with
  // - function which caused a problem;
  // - line where it was called;
  // - col where it was called.
  // l and c are updated with these values every time, but we only output a line with them if they don't come from the last item on the stack
  for (let call = 0; call < callStack.length; call++) {
    l = callStack[call][1];
    c = callStack[call][2];
    if (call + 1 < callStack.length) {
      arr.push(chalk.cyan(`  at ${callStack[call + 1][0]}f (${f}${l}:${c})\n`));
    }
  }

  // the array will become extremely large under certain conditions
  // we use fs to map its lines to their functions, find the first element which occurs twice, then drop all elements after its first occurrence
  let fs = arr.map((x, i) => Number(x[10]));
  for (let i = 0; i < fs.length; i++) {
    if (fs.findIndex(x => x == fs[i]) != i) {
      fs = fs.slice(0, fs.findIndex(x => x == fs[i]) + 1);
      break;
    }
  };

  arr = arr.slice(0, fs.length);

  // if something's on the stack, the line and column of the top-level call are stored in l and c
  // otherwise we're just at the top level
  if (callStack.length > 0) {
    arr.push(chalk.cyan(`  at ${f}${l}:${c}`));
  } else {
    arr.push(chalk.cyan(`  at ${f}${line}:${col}`));
  }

  return arr.join("");
}

const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms); });

module.exports = { parse, reset, log, warn };
