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
  if (file.slice(-4) != ".naz") {
    console.log("error: not a .naz file");
    return;
  }
  
  code = fs.readFileSync(path.join(__dirname, file), {encoding: "utf-8"}, function(){});
  code = code.split(/\r?\n/).map(l => l.split(""));
  
  console.log(Naz.parse(code));
}

naz();