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
  describe("prime", function() {
    this.should = "test if a number is prime";
    tests = [
      {input: "007", expected: "1"},
      {input: "035", expected: "0"},
      {input: "227", expected: "1"},
      {input: "001", expected: "0"},
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.parse("prime", test.input, test.expected);
      });
    });
  });
  describe("cg/compactify", function() {
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
  describe("cg/doublespeak", function() {
    this.should = "output each character twice";
    tests = [
      {input: "Double speak!\u0002", expected: "DDoouubbllee  ssppeeaakk!!"},
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.parse("cg/doublespeak", test.input, test.expected);
      });
    });
  });
  describe("cg/fullwidth", function() {
    this.should = "output each character with a space after it";
    tests = [
      {input: "Full width text\u0002", expected: "F u l l   w i d t h   t e x t "},
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.parse("cg/fullwidth", test.input, test.expected);
      });
    });
  });
  describe("cg/howhappy", function() {
    this.should = "output the happiness of the input emoticon";
    tests = [
      {input: ":(", expected: "0"},
      {input: ":-|", expected: "1"},
      {input: ":)", expected: "2"},
      {input: ":-D", expected: "3"}
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.parse("cg/howhappy", test.input, test.expected);
      });
    });
  });
  describe("cg/lowercase", function() {
    this.should = "convert the input string to lowercase";
    tests = [
      {input: "HELLO, WORLD\u0002", expected: "hello, world"},
      {input: "!!!\u0002", expected: "!!!"}
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.parse("cg/lowercase", test.input, test.expected);
      });
    });
  });

  afterEach(async function() {
    Naz.reset();
    await Common.sleep(100);
  });
});
