/*
  port of the original naz interpreter to web
  copyright (c) 2021 sporeball & contributors:
    - tobiasheineken
  MIT license
*/

var editor = ace.edit("editor");
var session = editor.getSession();

editor.setTheme("ace/theme/monokai");
editor.setOptions({
  fontSize: 16
});

session.setOption("indentedSoftWrap", false);
session.setUseWrapMode(true);

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

var error; // the error we've thrown, if any

var halt = false; // whether to halt the interpreter
var func = false; // are we in the middle of declaring a function?

var code = [];

var aceCode; // the code inside the ace editor

var elRun = document.getElementById("run");
var elPermalink = document.getElementById("permalink");
var elResult = document.getElementById("result");
var elInput = document.getElementById("input");
var elNullByte = document.getElementById("nullByte");

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
      let capturedNum = num;
      if (functions[capturedNum] == "") {
        throw new Error("use of undeclared function");
      }
      let abort = undefined;
      for (var i = 0; i < functions[capturedNum].length && !halt && !abort; i += 2) {
        let val = functions[capturedNum].substr(i, 2);
        num = Number(val.slice(0, 1));
        let instruction = val.slice(1, 2);
        abort = instructions[instruction]();
      }
    } else if (opcode == 1) {
      func = true;
    }
  },
  "h": () => {
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
      throw new Error("invalid output value");
    }

    output += val.repeat(num);
  },
  "v": () => {
    vnum = num;
    if (opcode == 0) {
      if (variables[vnum] == -999) {
        throw new Error("use of undeclared variable");
      }
      register = variables[vnum];
    } else if (opcode == 2) {
      variables[vnum] = register;
      opcode = 0;
    } else if (opcode == 3) {
      if (variables[vnum] == -999) {
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
    opcode = 0;
    if (register < cnum) {
      return conditional();
    }
  },
  "e": () => {
    if (opcode != 3) {
      throw new Error("conditionals must run in opcode 3");
    }
    jnum = num;
    chkCnum();
    opcode = 0;
    if (register == cnum) {
      return conditional();
    }
  },
  "g": () => {
    if (opcode != 3) {
      throw new Error("conditionals must run in opcode 3");
    }
    jnum = num;
    chkCnum();
    opcode = 0;
    if (register > cnum) {
      return conditional();
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
    if (input === undefined) {
      throw new Error("no input provided");
    }

    let val = input.charCodeAt(-1 + num);
    if (Number.isNaN(val)) {
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

var variables = {
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
    throw new Error("register value out of bounds");
  }
}

// check if we've actually set cnum
function chkCnum() {
  if (cnum == -999) {
    throw new Error("number to check against must be defined");
  }
}

// execute a correctly formatted conditional instruction
function conditional() {
  opcode = 0;
  num = jnum;
  instructions["f"]();
  cnum = -999; // reset cnum
  return true; // abort current function
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

  // we handle this as soon as possible to avoid issues
  if (code[n] == "0x") {
    func = false;
    opcode = 0;
    return;
  }

  if (opcode == 1 && func == false && code[n].slice(1, 2) != "f") {
    throw new Error("improper use of opcode 1");
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

async function parse(c, inp) {
  code = c;
  if (inp == "") {
    input = undefined;
  } else {
    input = inp;
  }

  while (i < code.length && !halt) {
    try {
      step(i);
    } catch (e) {
      if (e instanceof RangeError) {
        error = new Error("too much recursion");
      } else {
        error = e;
      }
      return `error: ${error.message}\n  at ${line}:${col}`
    }

    await sleep(1);
    i++;
  }

  if (halt) {
    return `program halted\n  at ${line}:${col}\noutput: ${output}`;
  }

  return `finished\noutput: ${output}`;
}

// utils
reset = () => {
  opcode = register = num = fnum = vnum = jnum = i = 0;
  cnum = -999;
  line = col = 1;
  input;
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
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function exec() {
  reset();

  let data = eol.crlf(session.getValue());

  code = [];
  for (var i = 0; i < data.length; i += 2) {
    code.push(data.substr(i, 2));
  }

  let inp = elInput.value;
  if (elNullByte.checked) inp += "\u0000";

  parse(code, inp).then(function(result) {
    elResult.innerHTML = result;
  });
}

elRun.onclick = function() {
  window.history.replaceState(null, null, window.location.href.split('?')[0]);
  exec();
}

elPermalink.onclick = function() {
  let data = eol.crlf(session.getValue());
  let inp = elInput.value;
  let n = elNullByte.checked;
  window.location.href = encodeURI(`${window.location.href.split('?')[0]}?code=${encodeURIComponent(data)}&input=${encodeURIComponent(inp)}&n=${n}`);
}

$("#disclaimer").click(function() {
  $('#disclaimer_modal').modal('toggle');
});

$("#close_disclaimer").click(function() {
  $('#disclaimer_modal').modal('toggle');
});

window.addEventListener("DOMContentLoaded", e => {
  let params = new URLSearchParams(window.location.search);
  session.setValue(params.get("code") || "9a7m2a1o");
  session.setValue(unescape(session.getValue()));
  elInput.value = params.get("input") || "";
  elInput.value = unescape(elInput.value);
  if (params.get("n") == "true") {
    elNullByte.checked = true;
  } else {
    elNullByte.checked = false;
  }

  exec();
});
