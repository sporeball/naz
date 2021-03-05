'use strict';

const mocha = require('mocha');
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_BEGIN,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = mocha.Runner.constants;

const chalk = require("chalk");
const symbols = require("log-symbols");
const draftlog = require("draftlog");
draftlog(console);

var indents = 0;
var passing = true; // are all tests in this suite passing so far?
var update;

function Decaf(runner) {
  const stats = runner.stats;

  runner.on(EVENT_SUITE_BEGIN, suite => {
    switch (indents) {
      case 1:
        console.log(`${indent()}${suite.title}`);
        break;
      case 2:
        console.log(`${indent()}${chalk.yellow(suite.title)} ${suite.total() > 1 ? `${chalk.cyan(`(${suite.total()} cases)`)}` : ""}`);
        if (suite.should) {
          indents++;
          update = console.draft(`${indent()}should ${suite.should} ${chalk.gray("...")}`);
        }
    }
    indents++;
  });

  runner.on(EVENT_SUITE_END, suite => {
    indents--;
    if (suite.should) {
      if (passing) {
        update(`${indent()}should ${suite.should} ${symbols.success}`)
      } else {
        update(`${indent()}should ${suite.should} ${symbols.error}`)
      }
    }
    if (indents == 3) indents--;
    passing = true;
  });

  runner.on(EVENT_TEST_PASS, test => {
    console.log(`${indent()}${test.title} ${symbols.success}`);
  });

  runner.on(EVENT_TEST_FAIL, (test, err) => {
    console.log(`${indent()}${test.title} ${symbols.error}`);
    let m = err.message.split("\n");
    indents++;
    console.log(`${indent()}${m[0]}`);
    if (m[1]) {
      m.shift();
      for (let line of m) {
        console.log(`${indent()}${line}`);
      }
    }
    indents--;
    passing = false;
  });

  runner.once(EVENT_RUN_END, () => {
    indents = 0;
    if (stats.failures == 0) {
      console.log(`\n${chalk.green(stats.passes + " passing")}`);
    } else {
      console.log(`\n${chalk.green(stats.passes + " passing,")} ${chalk.red(stats.failures + " failing")}\n`);
    }
  });
}

function indent() {
  return Array(indents).join('  ');
}

module.exports = Decaf;
