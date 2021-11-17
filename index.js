/*
  index.js
  naz interpreter
  copyright (c) 2021 sporeball & contributors:
    - tobiasheineken
  MIT license
*/

// dependencies
import chalk from 'chalk';

let contents;
let filename;

let opcode = 0;
let register = 0;

let num = 0; // number to be used for the next instruction
let fnum = 0; // number to be used when executing the f instruction
let cnum;

let line = 1;
let col = 1;

let input;
let output = '';

let u;

let functions = Array(10).fill('');
let variables = [];
const lines = Array(10).fill(0); // line numbers where functions are declared
const cols = Array(10).fill(0); // column numbers where functions are declared

let callStack = [];

let func = false; // are we in the middle of declaring a function?

const instructions = {
  // arithmetic instructions
  a: () => {
    register += num;
    chkRegister();
  },
  d: () => {
    if (num === 0) {
      throw new Error('division by zero');
    }
    register = Math.floor(register / num);
  },
  m: () => {
    register *= num;
    chkRegister();
  },
  s: () => {
    register -= num;
    chkRegister();
  },
  p: () => {
    if (num === 0) {
      throw new Error('division by zero');
    }
    register = register % num;
  },

  // program flow instructions
  f: () => {
    fnum = num;
    if (opcode === 0 || opcode === 3) {
      const capturedNum = num;
      if (functions[capturedNum] === '') {
        throw new Error('use of undeclared function');
      }

      // set the top frame's position to where we are
      callStack[0].splice(1, 2, line, col);
      // push a new frame with undefined position
      // if something goes wrong, it will be updated
      callStack.unshift([`${fnum}f`, undefined, undefined]);

      // move to the start of the called function
      line = lines[fnum];
      col = cols[fnum] + 2;

      let abort;
      for (let i = 0; i < functions[capturedNum].length && !abort; i += 2) {
        const val = functions[capturedNum].substr(i, 2);
        num = Number(val.slice(0, 1));
        const instruction = val.slice(1, 2);
        abort = instructions[instruction]();
        col += 2;
      }

      // discard the top frame
      callStack.shift();
      // restore position
      [, line, col] = callStack[0];
    } else if (opcode === 1) {
      if (functions[num] !== '') {
        throw new Error('attempt to redeclare function');
      }
      lines[num] = line;
      cols[num] = col;
      func = true;
    }
  },
  h: () => {
    warn('program halted');
    console.log(trace());
    if (output === '') {
      console.log(chalk`{gray (no output)}`);
    } else {
      console.log(`output: ${output}`);
    }
    process.exit(0);
  },
  o: () => {
    let val;
    if (register > -1 && register < 10) {
      val = register.toString();
    } else if (register === 10) {
      val = '\n';
    } else if (register > 31 && register < 127) {
      val = String.fromCharCode(register);
    } else {
      if (u) {
        val = String.fromCharCode(register);
      } else {
        throw new Error('invalid output value');
      }
    }

    output += val.repeat(num);
  },
  v: () => {
    if (opcode === 0) {
      if (variables[num] === undefined) {
        throw new Error('use of undeclared variable');
      }
      register = variables[num];
    } else if (opcode === 2) {
      variables[num] = register;
      opcode = 0;
    } else if (opcode === 3) {
      if (variables[num] === undefined) {
        throw new Error('use of undeclared variable');
      }
      cnum = variables[num];
    }
  },

  // conditional instructions
  l: () => {
    preConditional();
    if (register < cnum) {
      return conditional();
    }
  },
  e: () => {
    preConditional();
    if (register === cnum) {
      return conditional();
    }
  },
  g: () => {
    preConditional();
    if (register > cnum) {
      return conditional();
    }
  },

  // special instructions
  n: () => {
    if (variables[num] === undefined) {
      throw new Error('use of undeclared variable');
    }
    variables[num] = -(variables[num]);
  },
  r: () => {
    if (input === undefined) {
      throw new Error('no input provided');
    }

    const val = input.charCodeAt(-1 + num);
    if (Number.isNaN(val)) {
      if (num === 0) {
        throw new Error('cannot read the 0th character');
      }
      throw new Error('input string not long enough');
    }
    register = val;
    input = input.replace(input.slice(num - 1, num), '');
  },
  x: () => {
    if (num > 3) {
      throw new Error('invalid opcode');
    }

    opcode = num;
  }
};

function chkRegister () {
  if (!u && (register < -127 || register > 127)) {
    throw new Error('register value out of bounds');
  }
}

function preConditional () {
  if (opcode !== 3) {
    throw new Error('conditionals must run in opcode 3');
  }
  if (cnum === undefined) {
    throw new Error('number to check against must be defined');
  }
  opcode = 0;
}

// execute a correctly formatted conditional instruction
function conditional () {
  instructions.f();
  cnum = undefined; // reset cnum
  return true; // abort current function
}

function step () {
  const instruction = contents[line - 1].slice(col - 1, col + 1);

  if (instruction === '') {
    func = false;
    line++;
    col = 1;
    if (opcode === 1) {
      opcode = 0;
    }
    return;
  }

  const [number, letter] = instruction;

  // special case first
  if (number === '#') {
    throw new Error('a space is required before comments at the end of a line');
  }

  if (isNaN(number)) {
    if (!(number in instructions)) {
      throw new Error('invalid instruction');
    }
    throw new Error('missing number literal');
  } else {
    if (letter === '\r') {
      throw new Error('number literal missing an instruction');
    }
  }

  if (!isNaN(letter)) {
    throw new Error('attempt to chain number literals');
  }

  // the instruction is formatted correctly, so we continue

  num = Number(number);
  col++;

  if (!(letter in instructions)) {
    throw new Error('invalid instruction');
  }

  // we handle this as soon as possible to avoid issues
  if (instruction === '0x') {
    func = false;
    opcode = 0;
    col++;
    return;
  }

  if (opcode === 1 && func === false && letter !== 'f') {
    throw new Error('improper use of opcode 1');
  }

  if (opcode === 2 && letter !== 'v') {
    throw new Error('improper use of opcode 2');
  }

  if (opcode === 3) {
    // last instruction was 3x
    if (cnum === undefined && letter !== 'v') {
      throw new Error('improper use of opcode 3');
    }
    // last two instructions were 3x and [0-9]v
    if (cnum !== undefined && !(letter === 'e' || letter === 'g' || letter === 'l')) {
      throw new Error('improper use of opcode 3');
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

export default async function parse (c, file, inp, unlimited) {
  contents = c;
  filename = file;
  input = inp;
  u = unlimited;

  // create bottom frame with undefined position
  // if something goes wrong, it will be updated
  callStack.unshift([filename, undefined, undefined]);

  while (line <= contents.length) {
    try {
      step();
    } catch (err) {
      if (err instanceof RangeError) {
        err.message = 'too much recursion';
      }
      err.message += `\n${trace()}`;
      return `${chalk.red('error:')} ${err.message}`;
    }
  }

  if (output === '') {
    return chalk`{gray (no output)}`;
  } else {
    return `output: ${output}`;
  }
}

// utils
export const reset = () => {
  filename = cnum = input = u = undefined;
  opcode = register = num = fnum = 0;
  line = col = 1;
  output = '';
  func = false;
  functions = Array(10).fill('');
  variables = [];
};

export const warn = str => console.log(chalk.yellow(str));

const trace = () => {
  // update the position stored in the top frame
  callStack[0][1] = line;
  callStack[0][2] = col;

  // prettify
  callStack = callStack.map((frame, index) => {
    if (index === callStack.length - 1) {
      return `  at ${frame.join(':')}`;
    } else {
      let [namespace, line, col] = frame;
      return `  at ${namespace} (${filename}:${line}:${col})`;
    }
  });

  // truncate if needed
  if (callStack.length > 6) {
    callStack.splice(5, callStack.length - 6, '  ...');
  }

  callStack = callStack.map(line => chalk.cyan(line));

  return callStack.join('\n');
}
