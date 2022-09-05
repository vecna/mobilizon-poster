const login = require('../../lib/login');

const nconf = require('nconf');

nconf.argv().env();

it('attempts a login against a mobilizon instance and verifies that the token is received', async() => {

const email = nconf.get("email");
const password = nconf.get("password");
const api = nconf.get("api");
const token = await login.perform( email, password, api);
expect(token.length).toBeGreaterThan(20)
});