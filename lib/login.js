const _ = require('lodash');
const nconf = require('nconf');
const debug = require('debug')('lib:login');

const shared = require('./shared');

nconf.argv().env().file({file: "config.json"});

async function perform(userparms) {

    const connectToAuthQ = {
        "operationName":"Login",
        "variables": {
            "email": userparms.login,
            "password": userparms.password
        },
        "query":"mutation Login($email: String!, $password: String!) {\n  login(email: $email, password: $password) {\n    accessToken\n    refreshToken\n    user {\n      id\n      email\n      role\n      __typename\n    }\n    __typename\n  }\n}\n"
    };

    if(userparms.api) {
        debug("Setting as API endpoint %s", userparms.api);
        nconf.set('api', userparms.api);
    }

    let response = null, responseBody = null;
    try {
        response = await shared.mobilizoneHTTPAPIfetch(connectToAuthQ, null);
        responseBody = await response.json();
    } catch(error) {
        debug(`perform login error ${error.message}`);
        debug(`Response code ${response.status}`);
        throw error;
    }

    const accessToken = _.get(responseBody, 'data.login.accessToken');
    if(!accessToken.length) {
        debug("Error, not found the accessToken! %j", responseBody);
        throw new Error("accessToken not found");
    }
    return accessToken;
}

async function getInfo(token) {
    const getInfoQ = {
        "operationName":null,
        "variables":{},
        "query":"{\n  identities {\n    id\n    avatar {\n      id\n      url\n      __typename\n    }\n    type\n    preferredUsername\n    name\n    __typename\n  }\n}\n"
    };

    let responseBody = null;
    try {
        const response = await shared.mobilizoneHTTPAPIfetch(getInfoQ, token);
        responseBody = await response.json();
    } catch(error) {
        console.log(".json decode error?", error);
        process.exit(1)
    }
    const retval = _.get(responseBody, 'data.identities');
    debug("Retrieved user info: %j", retval);
    return retval;
}

module.exports = {
    perform,
    getInfo,
}
