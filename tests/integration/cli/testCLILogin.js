const nconf = require("nconf");
const mockFs = require("mock-fs");
const { connectAndSaveTokens } = require("../../../bin/login");
const fs = require("fs");
const shared = require("../../../lib/shared");

const TIMEOUT=70000


describe("CLI", () => {
  afterEach(() => {
    mockFs.restore();
  });

  beforeEach(() => {

    mockFs({ [shared.identity_file_path]: {} })

  });

  it("attempts to run the CLI login function", async () => {
    // this test relies on the env email and password variables that will be read by nconf as CLI arguments


    console.log = jest.fn();
    await connectAndSaveTokens();

    const login_file_content = JSON.parse(
      fs.readFileSync(shared.identity_filename, "utf-8")
    );
    expect(login_file_content.length).toBe(1);
    expect(login_file_content[0].token.length).toBeGreaterThan(20);

    const api = nconf.get("api");
    expect(login_file_content[0].server).toBe(api);

    expect(console.log.mock.calls[0][0]).toBe(
        `Saved authentication token in ${
            shared.identity_filename
        }. Servers supported: [${nconf.get("api")}]`
    );
  }, TIMEOUT);

  it("attempts to run the CLI login function when an identity file already exists", async () => {
    mockFs({
      [shared.identity_filename]: JSON.stringify([
        {
          identities: [[Object]],
          server: "some api",
          date: "2022-09-06T17:52:13.661Z",
          token: "some_token",
        },
      ]),
    });

    console.log = jest.fn();
    await connectAndSaveTokens();
    const login_file_content = JSON.parse(
      fs.readFileSync(shared.identity_filename, "utf-8")
    );
    expect(login_file_content.length).toBe(2);
    expect(console.log.mock.calls[0][0]).toBe(
      `Saved authentication token in ${
        shared.identity_filename
      }. Servers supported: [some api,${nconf.get("api")}]`
    );
  });


}, TIMEOUT);
