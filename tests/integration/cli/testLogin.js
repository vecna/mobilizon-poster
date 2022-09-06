const nconf = require('nconf');
const {connectAndSaveTokens} = require("../../../bin/login");
const fs = require("fs");
const shared = require("../../../lib/shared");
const mockFs = require('mock-fs');

nconf.argv().env();

afterAll(() => {
    mockFs.restore()
});

beforeAll(() => {
    //mocking the identity file location

    const idPath = shared.identity_file_path
    mockConfig = {}
    mockConfig[idPath]={}
    mockFs(mockConfig)
})

it('attempts to run the CLI login function', async () => {
    // this test relies on the env email and password variables that will be read by nconf as CLI arguments

    await connectAndSaveTokens();

    const login_file_content = JSON.parse(fs.readFileSync(shared.identity_filename, "utf-8"))
    expect(login_file_content.length).toBe(1)
    expect(login_file_content[0].token.length).toBeGreaterThan(20)

    const api = nconf.get("api");
    expect(login_file_content[0].server).toBe(api)

});


it('attempts to run the CLI login function when an identity file already exists', async () => {
    [
        {
            identities: [[Object]],
            server: 'https://mobilizon.libr.events/api',
            date: '2022-09-06T17:52:13.661Z',
            token: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJtb2JpbGl6b24iLCJleHAiOjE2NjI0ODc2MzIsImlhdCI6MTY2MjQ4NjczMiwiaXNzIjoibW9iaWxpem9uIiwianRpIjoiYTgwODQ2NGItZDQ3NC00NDhhLWJjMTctMzI0MjAzMmZjNzkwIiwibmJmIjoxNjYyNDg2NzMxLCJzdWIiOiJVc2VyOjExIiwidHlwIjoiYWNjZXNzIn0.6ty4JYmx5jVWlWGn3kNhJA_FBFjlKMdHOwZoes4oD-NMS20Bg1ynDc0-5l8BPgBhCo1M_tnqH-2UNvZnj-kjGw'
        }
    ]
})