const _ = require('lodash');
const nconf = require('nconf');
const debug = require('debug')('lib:login');
var { GraphQLClient, gql } = require('graphql-request')
const shared = require('./shared');

nconf.argv().env().file({file: "config.json"});
var login_query = gql`mutation Login($email: String!, $password: String!)
     {  login(email: $email, password: $password)   
    { accessToken refreshToken user  
     {   id  
       email    
     role   
      __typename }  
     __typename}\n}\n`

/**
 * Performs a login and returns the token
 * @param email
 * @param password
 * @param graphql_endpoint
 * @return {String} The token returned by the mobilizon instance
 */
async function perform(email, password, graphql_endpoint) {

    const client = new GraphQLClient(graphql_endpoint)
    const data = await client.request(login_query,{email,password})
    return data.login.accessToken
}

async function getInfo(token) {
    const getInfoQ = {
        "operationName": null,
        "variables": {},
        "query": "{\n  identities {\n    id\n    avatar {\n      id\n      url\n      __typename\n    }\n    type\n    preferredUsername\n    name\n    __typename\n  }\n}\n"
    };

    let responseBody = null;
    try {
        const response = await shared.mobilizoneHTTPAPIfetch(getInfoQ, token);
        responseBody = await response.json();
    } catch (error) {
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
