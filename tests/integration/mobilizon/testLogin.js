const login = require('../../../lib/login');

const nconf = require('nconf');
const {FetchError} = require("node-fetch");


nconf.argv().env();

it('attempts a login against a mobilizon instance and verifies that the token is received', async () => {

    const email = nconf.get("email");
    const password = nconf.get("password");
    const api = nconf.get("api");
    const token = await login.perform(email, password, api);
    expect(token.length).toBeGreaterThan(20)

});

it('attempts a login against an unavailable mobilizon instance', async () => {

    const email = nconf.get("email");
    const password = nconf.get("password");
    const api = "https://some_api.com/api";
    await expect(() => login.perform(email, password, api)).rejects.toThrow(FetchError)
});
