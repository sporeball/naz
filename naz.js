/*
  naz.js
  interface to naz interpreter
  copyright (c) 2019 sporeball
  MIT license
*/

const Naz = require("./index.js")
const fs = require("fs")
const path = require("path")

function naz() {
  var args = process.argv.slice(2);
  var file = args[0];
  var filename;
  
  if (file.slice(-4) != ".naz") {
    Naz.err("not a .naz file");
    return;
  }
  
  if (file.indexOf("/") > -1) {
    filename = file.slice(file.lastIndexOf("/") + 1, file.length);
  } else {
    filename = file;
  }
  
  var contents = fs.readFileSync(path.join(__dirname, file), {encoding: "utf-8"}, function(){});
  var code = [];
  for (var i = 0; i < contents.length; i += 2) {
    code.push(contents.substr(i, 2));
  }
  
  Naz.parse(code, filename);
}

naz();