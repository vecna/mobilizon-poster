const login = require('../../lib/login');

const nconf = require('nconf');

nconf.argv().env();


it('attempts a login against a mobilizon instance', async() => {

const username = nconf.get("username");
const password = nconf.get("password");
const api = nconf.get("api");
const token = await login.perform({ login: username, password, api });
const userInfo = await login.getInfo(token);

expect(token).toBeTruthy()
});