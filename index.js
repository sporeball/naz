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

var comment = false; // comment flag
var halt = false; // halt flag

function parse(code, file) {
  filename = file;
  
  var instructions = {
    // number literals
    "0": () => { num = 0; },
    "1": () => { num = 1; },
    "2": () => { num = 2; },
    "3": () => { num = 3; },
    "4": () => { num = 4; },
    "5": () => { num = 5; },
    "6": () => { num = 6; },
    "7": () => { num = 7; },
    "8": () => { num = 8; },
    "9": () => { num = 9; },
    
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
      if (register > -1 && register < 10) {
        output += register.toString();
      } else if (register == 10) {
        output += "\n";
      } else if (register > 31 && register < 127) {
        output += String.fromCharCode(register);
      } else {
        err("invalid output value");
        trace();
      }
    },
    
    // other instructions
    ":": () => {
      comment = true;
    }
  }
  
  function chkRegister() {
    if (register < -127 || register > 127) {
      err("register value out of bounds");
      trace();
    }
  }
  
  for (var i = 0; i < code.length; i++) {
    line = i + 1;
    comment = false; // reset comment flag
    for (var j = 0; j < code[i].length; j++) {
      col = j + 1;
      var instruction = code[i][j];
      
      if (comment) break;
      
      if (!(instruction in instructions)) {
        err("invalid instruction");
        trace();
        return;
      }
      
      instructions[instruction]();
      if (halt) return;
    }
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