const nconf = require('nconf');
var { GraphQLClient, gql } = require('graphql-request')

nconf.argv().env().file({file: "config.json"});
var loginQuery = gql`mutation Login($email: String!, $password: String!)
     {  login(email: $email, password: $password)   
    { accessToken refreshToken user  
     {   id  
       email    
     role   
      __typename }  
     __typename}\n}\n`
var getIdentityInfoQuery=gql`{ identities {  id avatar 
            {   id   url   __typename }
         type preferredUsername name __typename
          
    }}`
/**
 * Performs a login and returns the token
 * @param email
 * @param password
 * @param graphql_endpoint
 * @return {String} The token returned by the mobilizon instance
 */
async function perform(email, password, graphql_endpoint) {

    const client = new GraphQLClient(graphql_endpoint)
    const data = await client.request(loginQuery,{email,password})
    return data.login.accessToken
}

async function getIdentityInfo(token, graphql_endpoint) {

    const client = new GraphQLClient(graphql_endpoint, {headers: {
            authorization: 'Bearer '+token,
        }})
    return await client.request(getIdentityInfoQuery)
}

module.exports = {
    perform,
    getInfo: getIdentityInfo,
}
