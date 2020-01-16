var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.setOptions({
  fontSize: 16
})

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

var halt = false; // whether to halt the interpreter
var func = false; // are we in the middle of declaring a function?

var c; // the code inside the ace editor

var run = document.getElementById("run");
var result = document.getElementById("result");

function parse(code, input) {
  input = input;

  var instructions = {
    // arithmetic instructions
    "a": () => {
      register += num;
      chkRegister();
    },
    "d": () => {
      if (num == 0) {
        err("division by zero");
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
        err("division by zero");
      }
      register = register % num;
    },

    // program flow instructions
    "f": () => {
      fnum = num;
      if (opcode == 0 || opcode == 3) {
        if (functions[fnum] == "") {
          err("use of undeclared function");
        }
        for (var i = 0; i <= functions[fnum].length; i += 2) {
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
        err("invalid output value");
      }

      output += val.repeat(num);
    },
    "v": () => {
      vnum = num;
      if (opcode == 0) {
        if (variables[vnum] == -999) {
          err("use of undeclared variable");
        }
        register = variables[vnum];
      } else if (opcode == 2) {
        variables[vnum] = register;
        opcode = 0;
      } else if (opcode == 3) {
        if (variables[vnum] == -999) {
          err("use of undeclared variable");
        }
        cnum = variables[vnum];
      }
    },

    // conditional instructions
    "l": () => {
      if (opcode != 3) {
        err("conditionals must run in opcode 3");
      }
      jnum = num;
      chkCnum();
      if (register < cnum) {
        conditional();
      }
    },
    "e": () => {
      if (opcode != 3) {
        err("conditionals must run in opcode 3");
      }
      jnum = num;
      chkCnum();
      if (register == cnum) {
        conditional();
      }
    },
    "g": () => {
      if (opcode != 3) {
        err("conditionals must run in opcode 3");
      }
      jnum = num;
      chkCnum();
      if (register > cnum) {
        conditional();
      }
    },

    // special instructions
    "r": () => {
      if (input == "") {
        err("no input provided");
      }

      let val = input.charCodeAt(-1 + num);
      if (Number.isNaN(val)) {
        err("input string not long enough")
      }

      register = val;
      input = input.replace(input.slice(num - 1, num), "");
    },
    "x": () => {
      if (num > 3) {
        err("invalid opcode");
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
    if (register < -127 || register > 127) {
      err("register value out of bounds");
    }
  }

  // check if we've actually set cnum
  function chkCnum() {
    if (cnum == -999) {
      err("number to check against must be defined");
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
  async function main() {main:{
    while (i < code.length) {
      try {
        step(i);
      } catch (e) {
        return;
        if (e instanceof RangeError) {
          err("too much recursion");
        }
      }

      await sleep(1);
      i++;
    }

    log(`finished`)
    log(`\noutput: ${output}`)
    return;
  }}
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
        err("invalid instruction");
      }
      err("missing number literal");
    } else {
      if (code[n].slice(1, 2) == "\r") {
        err("number literal missing an instruction");
      }
    }

    if (!isNaN(code[n].slice(1, 2))) {
      err("attempt to chain number literals");
    }

    // the instruction is formatted correctly, so we continue

    if (func) { // are we in the middle of declaring a function?
      // add the parsed command to the function we're declaring
      functions[fnum] += code[n];
      return;
    }

    num = Number(code[n].slice(0, 1));
    col++;

    var instruction = code[n].slice(1, 2);
    if (!(instruction in instructions)) {
      err("invalid instruction");
    }

    if (opcode == 2 && code[n].slice(1, 2) != "v") {
      err("improper use of opcode 2");
    }

    // everything's correct, run the instruction
    instructions[instruction]();

    col++;
  }
}

// utils
log = str => { result.innerHTML += str; }

err = str => {
  log(`error: ${str}`);
  log(`\n  at ${line}:${col}`);
  break main;
}

function reset() {
  opcode = 0;
  register = 0;
  num = 0;
  fnum = 0;
  vnum = 0;
  jnum = 0;
  cnum = -999;
  i = 0;
  line = col = 1;
  input;
  output = "";
  halt = false;
  func = false;
}

// ace code

editor.getSession().on('change', function () {
  c = editor.getSession().getValue();
});

editor.on("paste", function() {
  let v = editor.getSession().getValue();
  editor.setValue(v.replace(/\r\n|\n\r|\r/g, "\r\n"));
});

c = editor.getSession().getValue();

function exec() {
  reset();

  var code = [];
  for (var i = 0; i < c.length; i += 2) {
    code.push(c.substr(i, 2));
  }

  result.innerHTML = "";
  parse(code, "");
}

exec();

run.onclick = function() {
  exec();
}

$("#disclaimer").click(function() {
  $('#disclaimer_modal').modal('toggle');
});

$("#close_disclaimer").click(function() {
  $('#disclaimer_modal').modal('toggle');
});
