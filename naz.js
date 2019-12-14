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
  
  code = fs.readFileSync(path.join(__dirname, file), {encoding: "utf-8"}, function(){});
  code = code.split("").filter(val => val != "\r");
  
  Naz.parse(code, filename);
}

naz();