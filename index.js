/*
  index.js
  naz interpreter
  copyright (c) 2019 sporeball
  MIT license
*/

const chalk = require("chalk")

var filename;

var register = num = ptr = 0;
var line = col = 1;

var output = ""; // output

var halt = false; // halt flag

function parse(code, file) {
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
    }
  }
  
  function chkRegister() {
    if (register < -127 || register > 127) {
      errTrace("register value out of bounds");
    }
  }
  
  for (var i = 0; i < code.length; i++) {
    if (code[i] == "\r\n") {
      line++;
      col = 1;
      continue;
    }
    
    if (isNaN(code[i].slice(0, 1))) {
      if (!(code[i].slice(0, 1) in instructions)) {
        errTrace("invalid instruction");
      }
      errTrace("missing number literal");
    } else {
      if (code[i].slice(1, 2) == "\r") {
        errTrace("number literal missing an instruction");
      }
    }
    
    if (!isNaN(code[i].slice(1, 2))) {
      errTrace("attempt to chain number literals");
    }
    
    num = Number(code[i].slice(0, 1));
    col++;
    
    var instruction = code[i].slice(1, 2);
    if (!(instruction in instructions)) {
      errTrace("invalid instruction");
    }
    
    if (halt) return;
    
    instructions[instruction]();
    if (halt) return;
    
    col++;
  }
  
  log(output + "\n");
  success("program ran successfully.")
  return;
}

log = str => { console.log(chalk.white(str)) }
info = str => { log(chalk.cyan(str)) }
success = str => { log(chalk.green(str)) }
warn = str => { log(chalk.yellow(str)) }

err = str => {
  log(chalk.red("error: ") + str);
  halt = true;
}

errTrace = str => {
  err(str);
  trace();
}

trace = () => { info(`  at ${filename}:${line}:${col}`); }

exports.parse = parse;
exports.log = log;
exports.warn = warn;
exports.err = err;