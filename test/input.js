const Naz = require("../index.js");
const Common = require("./common.js");
const chalk = require("chalk");

var tests;

describe("input", function() {
  describe("rot13", function() {
    this.should = "ROT-13 transform the input";
    tests = [
      {input: "Hello, World!\u0002", expected: "Uryyb, Jbeyq!"},
      {input: "!@#$%^&*()\u0002", expected: "!@#$%^&*()"},
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.parse("rot13", test.input, test.expected);
      });
    });
  });
  describe("compactify", function() {
    this.should = "remove all vowels after the first character";
    tests = [
      {input: "i\u0002", expected: "i"},
      {input: "ate\u0002", expected: "at"},
      {input: "potato\u0002", expected: "ptt"}
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.parse("cg/compactify", test.input, test.expected);
      });
    });
  });

  afterEach(async function() {
    Naz.reset();
    await Common.sleep(100);
  });
});
