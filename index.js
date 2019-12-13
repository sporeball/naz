/*
  index.js
  naz interpreter
  copyright (c) 2019 sporeball
  MIT license
*/

var register = 0; // value in the register
var num = 0; // value to be used for next arithmetic instruction
var ptr = 0; // file pointer
var output = ""; // output

function parse(code) {
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
        throw new Error("error: division by zero");
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
      throw new Error("program execution halted.");
    },
    "o": () => {
      if (register > -1 && register < 10) {
        output += register.toString();
      } else if (register == 10) {
        output += "\n";
      } else if (register > 31 && register < 127) {
        output += String.fromCharCode(register);
      } else {
        throw new Error("error: invalid output value");
      }
    }
  }
  
  function chkRegister() {
    if (register < -127 || register > 127) {
      throw new Error("error: register overflow/underflow");
    }
  }
  
  for (var i = 0; i < code.length; i++) {
    for (var j = 0; j < code[i].length; j++) {
      var instruction = code[i][j];
      instructions[instruction]();
    }
  }
  
  return output;
}

exports.parse = parse;