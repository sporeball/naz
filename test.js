const Naz = require("./index.js");
const fs = require("fs");
const chalk = require("chalk");

const pWaitFor = require("p-wait-for");
const pathExists = require("path-exists");

var code = [];

function parse(contents, input, expected) {
  return new Promise(function(resolve, reject) {
    code = [];
    for (var i = 0; i < contents.length; i += 2) {
      code.push(contents.substr(i, 2));
    }

    Naz.parse(code, "", 1, input, false, true);
    (async () => {
      await pWaitFor(() => pathExists("output.txt"));
    })();

    setTimeout(function() {
      if (fs.readFileSync("output.txt", {encoding: "utf-8"}, function(){}) != expected) {
        reject("output does not match expected!");
      } else {
        resolve();
      }
    }, 100);
  }).catch(err => console.log(chalk.red(err)));
}

async function test(contents, input, expected) {
  await parse(contents, input, expected);
  fs.unlinkSync("output.txt");
  Naz.reset();
}

test("3a3o3a3o3a3o", "", "333666999");
setTimeout(function() {
  test("9a8m1o9a9a9a2a1o7a2o3a1o3d7a1o9s3s1o8a2m7a1o9a9a6a1o3a1o6s1o8s1o3d1o", "", "Hello, World!");
}, 101);
