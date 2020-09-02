const Naz = require("../index.js");
const mocha = require("mocha");

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

    Naz.parse(code, "", 1, input, false, true).then(function(output) {
      setTimeout(function() {
        if (output.indexOf(`${chalk.red("error:")}`) == 0) {
          reject(new Error(output));
        }
        output = output.slice(8);
        if (output != expected) {
          reject(new Error(`${chalk.red("error:")} output was ${output}, expected ${expected}`));
        } else {
          resolve();
        }
      }, 200);
    });
  }).catch();
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

describe("no_input", function() {
  describe("333", function() {
    it("should output '333666999'", async function() {
      await parse("3a3o3a3o3a3o", "", "333666999");
    });
  });
  describe("helloworld", function() {
    it("should output 'Hello, World!'", async function() {
      await parse("9a8m1o9a9a9a2a1o7a2o3a1o3d7a1o9s3s1o8a2m7a1o9a9a6a1o3a1o6s1o8s1o3d1o", "", "Hello, World!");
    });
  });

  afterEach(async function() {
    Naz.reset();
    await sleep(100);
  });
});
