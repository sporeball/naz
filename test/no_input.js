const Naz = require("../index.js");
const Common = require("./common.js");

describe("no_input", function() {
  describe("helloworld", function() {
    it("should output 'Hello, World!'", async function() {
      await Common.parse("helloworld", "", "Hello, World!");
    });
  });
  describe("cg/333", function() {
    it("should output '333666999'", async function() {
      await Common.parse("cg/333", "", "333666999");
    });
  });

  afterEach(async function() {
    Naz.reset();
    await Common.sleep(100);
  });
});
