import * as Common from './common.js';
import { reset } from '../index.js';

describe("no_input", function() {
  describe("helloworld", function() {
    it("should output 'Hello, World!'", async function() {
      await Common.test("helloworld", "", "Hello, World!");
    });
  });
  describe("cg/333", function() {
    it("should output '333666999'", async function() {
      await Common.test("cg/333", "", "333666999");
    });
  });

  afterEach(async function() {
    reset();
    await Common.sleep(100);
  });
});
