import * as Common from './common.js';
import { reset } from '../index.js';

import chalk from 'chalk';

let tests;

describe("input", function() {
  describe("rot13", function() {
    this.should = "ROT-13 transform the input";
    tests = [
      {input: "Hello, World!\u0000", expected: "Uryyb, Jbeyq!"},
      {input: "!@#$%^&*()\u0000", expected: "!@#$%^&*()"},
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.test("rot13", test.input, test.expected);
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
        await Common.test("prime", test.input, test.expected);
      });
    });
  });
  describe("cg/compactify", function() {
    this.should = "remove all vowels after the first character";
    tests = [
      {input: "i\u0000", expected: "i"},
      {input: "ate\u0000", expected: "at"},
      {input: "potato\u0000", expected: "ptt"}
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.test("cg/compactify", test.input, test.expected);
      });
    });
  });
  describe("cg/doublespeak", function() {
    this.should = "output each character twice";
    tests = [
      {input: "Double speak!\u0000", expected: "DDoouubbllee  ssppeeaakk!!"},
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.test("cg/doublespeak", test.input, test.expected);
      });
    });
  });
  describe("cg/fullwidth", function() {
    this.should = "output each character with a space after it";
    tests = [
      {input: "Full width text\u0000", expected: "F u l l   w i d t h   t e x t "},
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.test("cg/fullwidth", test.input, test.expected);
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
        await Common.test("cg/howhappy", test.input, test.expected);
      });
    });
  });
  describe("cg/lowercase", function() {
    this.should = "convert the input string to lowercase";
    tests = [
      {input: "HELLO, WORLD\u0000", expected: "hello, world"},
      {input: "!!!\u0000", expected: "!!!"}
    ];
    tests.forEach(function(test) {
      it(`${test.input} ${chalk.gray("->")} ${test.expected}`, async function() {
        await Common.test("cg/lowercase", test.input, test.expected);
      });
    });
  });

  afterEach(async function() {
    reset();
  });
});
