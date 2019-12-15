/*
  index.js
  naz interpreter
  copyright (c) 2019 sporeball
  MIT license
*/

const chalk = require("chalk")

var filename;

var register = 0; // value in the register
var num = 0; // value to be used for next arithmetic instruction

var ptr = 0; // file pointer
var line = 1;
var col = 1;

var output = ""; // output

var halt = false; // halt flag

function parse(code, file) {
  // console.log(code);
  filename = file;
  
  var instructions = {
    // arithmetic instructions
    "a": () => {
      register += num;
      chkRegister();
      num = 0;
    },
    "d": () => {
      if (num == 0) {
        err("division by zero");
        trace();
      }
      register = Math.floor(register / num);
      num = 0;
    },
    "m": () => {
      register *= num;
      chkRegister();
      num = 0;
    },
    "s": () => {
      register -= num;
      chkRegister();
      num = 0;
    },
    "p": () => {
      register = register % num;
      num = 0;
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
        err("invalid output value");
        trace();
      }
      
      for (let i = 0; i < num; i++) {
        output += val;
      }
    }
  }
  
  function chkRegister() {
    if (register < -127 || register > 127) {
      err("register value out of bounds");
      trace();
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
        err("invalid instruction");
        trace();
        return;
      }
      err("missing number literal");
      trace();
      return;
    } else {
      if (code[i].slice(1, 2) == "\r") {
        err("number literal missing an instruction");
        trace();
        return;
      }
    }
    
    if (!isNaN(code[i].slice(1, 2))) {
      err("attempt to chain number literals");
      trace();
      return;
    }
    
    num = Number(code[i].slice(0, 1));
    col++;
    
    var instruction = code[i].slice(1, 2);
    if (!(instruction in instructions)) {
      err("invalid instruction");
      trace();
      return;
    }
    
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

trace = () => { info(`  at ${filename}:${line}:${col}`) }

exports.parse = parse;
exports.log = log;
exports.warn = warn;
exports.err = err;