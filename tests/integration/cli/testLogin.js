const nconf = require('nconf');
const {connectAndSaveTokens} = require("../../../bin/login");
const fs = require("fs");
const shared = require("../../../lib/shared");

nconf.argv().env();

it('attempts to run the CLI login function', async () => {
    // this test relies on the env email and password variables that will be read by nconf as CLI arguments

    await connectAndSaveTokens();
    const login_file_content = JSON.parse(fs.readFileSync(shared.identity_filename, "utf-8"))
    expect(login_file_content.length).toBe(1)
    expect(login_file_content[0].token.length).toBeGreaterThan(20)

    const api = nconf.get("api");
    expect(login_file_content[0].server).toBe(api)


});
