const Naz = require("../index.js");
const Common = require("./common.js");

describe("no_input", function() {
  describe("333", function() {
    it("should output '333666999'", async function() {
      await Common.parse("3a3o3a3o3a3o", "", "333666999");
    });
  });
  describe("helloworld", function() {
    it("should output 'Hello, World!'", async function() {
      await Common.parse("9a8m1o9a9a9a2a1o7a2o3a1o3d7a1o9s3s1o8a2m7a1o9a9a6a1o3a1o6s1o8s1o3d1o", "", "Hello, World!");
    });
  });

  afterEach(async function() {
    Naz.reset();
    await Common.sleep(100);
  });
});
