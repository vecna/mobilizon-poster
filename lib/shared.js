const _ = require('lodash');
const nconf = require('nconf');
const debug = require('debug')('lib:shared');
const fetch = require('node-fetch');
const fs = require('fs');

function integrityChecks(specific={}) {
    /* this function performs integrity checks to verify everything it is ready to work */
    const docs ="https://quickened.interoperability.tracking.exposed/mobilizon-poster";
    const issues = "https://github.com/vecna/mobilizon-poster/issues";

    _.each(_.extend(mandatoryKeys, specific), function(message, kname) {
        const exists = nconf.get(kname);
        if(_.isUndefined(exists)) {
            console.log(`\n"${kname}" option missing!\t\t${message}`);
            console.log(`\nRequired options:\t\t${_.keys(mandatoryKeys)}`)
            console.log(`\n\nTo provide variables like ${kname}, you have three ways: --longopt, environment, or config.json`);
            console.log(`You can check out the documentation here: ${docs}`);
            console.log(`And if this should be different, please raise your point with a ticket: ${issues}`);
            process.exit(1);
        }
    })
}

async function getToken() {
    let lastToken = null;
    try {
        const authmat = fs.readFileSync('identities.json', 'utf-8');
        const authcodes = JSON.parse(authmat);
        lastToken = authcodes.token;
        console.log(`Identities found ${authcodes.identities.length} (${authcodes.identities[0].name}) token acquired!`);
    } catch(error) {
        debug("Unable to get token: %s", error.message);
        console.log("Unable to get tokens: you should perform login");
    }

    /* perform a query to verify if the token is till valid */

    return lastToken;
}

async function mobilizoneHTTPAPIfetch(body, auth) {
    const payload = {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1"
        },
        "referrerPolicy": "same-origin",
        "body": JSON.stringify(body),
        "method": "POST",
        "mode": "cors"
    };
    if(auth)
        payload.headers.authorization = "Bearer " + auth;

    return await fetch(nconf.get('api'), payload);
}

function fetchVariables(varmap) {
    const retval = {};
    const errors = _.compact(_.map(varmap, function(f, name) {
        const readv = nconf.get(name);
        debugger;
        if(!readv || !readv.length)
            return "--" + name + " is required";
        
        const lapz = f(readv);
        if(!lapz)
            return "--" + name + " invalid format? " + lapz;

        console.log(name, lapz);
        retval[name] = lapz;
        return null;
    }));
    
    if(errors.length) {
        console.log(errors.join("\n"));
        process.exit(1);
    }
    return retval;
}

module.exports = {
    integrityChecks,
    mobilizoneHTTPAPIfetch,
    fetchVariables,
    getToken,
}