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

var indents = 0;

function Decaf(runner) {
  const stats = runner.stats;

  runner.on(EVENT_SUITE_BEGIN, suite => {
    switch (indents) {
      case 1:
        console.log(`${indent()}${suite.title}`);
        break;
      case 2:
        console.log(`${indent()}${chalk.yellow(suite.title)}`);
    }
    indents++;
  });

  runner.on(EVENT_SUITE_END, () => {
    indents--;
  });

  runner.on(EVENT_TEST_PASS, test => {
    console.log(`${indent()}${test.title} ${symbols.success}`);
  });

  runner.on(EVENT_TEST_FAIL, (test, err) => {
    console.log(`${indent()}${test.title} ${symbols.error}`);
    console.log(`${indent()}${err.message}`);
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
