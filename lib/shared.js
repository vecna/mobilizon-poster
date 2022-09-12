const _ = require('lodash');
const nconf = require('nconf');
const debug = require('debug')('lib:shared');
const IOlog = require('debug')('lib:shared(IO)');
const fetch = require('node-fetch');
const fs = require('fs');
const os = require('os');
const path = require('path');

const IDENTITY_PATH=os.tmpdir()
const IDENTITY_FILENAME = path.join(IDENTITY_PATH,'.identities.json')

function integrityChecks(specific={}) {
    /* this function performs integrity checks to verify everything it is ready to work */
    const docs ="https://libr.events/mobilizon-poster";
    const issues = "https://github.com/vecna/mobilizon-poster/issues";

    _.each(specific, function(message, kname) {
        const exists = nconf.get(kname);
        if(_.isUndefined(exists)) {
            console.log(`\n--${kname} missing!\t\t${message}`);
            console.log(`\nRequired options:\t\t${_.keys(specific)}`)
            console.log(`\nTo provide variables like ${kname}, you have three ways: --longopt, environment, or config.json`);
            console.log(`You can check out the documentation here: ${docs}`);
            console.log(`And if this should be different, please raise your point with a ticket: ${issues}`);
            process.exit(1);
        }
    })
}

function fetchOrganizerId() {
    const currentConfig = retrieveConfig();
    /* perform a query to verify if the token is till valid */
    debug(`Returning organizer Id ${currentConfig.identities[0].id}`);
    return currentConfig.identities[0].id;
}

function getToken() {
    const currentConfig = retrieveConfig();
    /* perform a query to verify if the token is till valid */
    const token = currentConfig.token;
    debug(`Returning a token ${token.length} from ${currentConfig.date}`);
    return currentConfig.token;
}

function retrieveConfig() {
    /* to pick the right token, we need to know also which server it refers,
       i looks into the .identities.json file  */
    const server = nconf.get('api');
    try {
        const authmat = fs.readFileSync(IDENTITY_FILENAME, 'utf-8');
        const authcodes = JSON.parse(authmat);
        const correct = _.find(authcodes, { server });
        if(!correct) {
            debug(`Among the tokens in ${IDENTITY_FILENAME} not found ${server}`);
            throw new Error(`Token not found in ${IDENTITY_FILENAME}`);
        }

        return correct ;

    } catch(error) {
        debug("Unable to get token: %s", error.message);
    }
    throw new Error(`Missing authentication material! please perform login first`);
}

async function mobilizoneHTTPAPIfetch(body, auth) {
    const apiUrl = nconf.get('api');
    if(!apiUrl || !apiUrl.length || !_.startsWith(apiUrl, 'http')) {
        console.log('Error: you should specify an API url with option --api, or in config.json');
        console.log('The URL should be absolute, for example, in config.json: {"api":"https://mobilize.berlin/api"}');
        throw new Error('missing endpoint (--api or config.json or environment "api")');
    }
    debug("Connecting to %s", apiUrl);
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

    const response = await fetch(apiUrl, payload);
    IOlog(`Status: ${response.status}`);
    for (let [key, value] of response.headers) {
        IOlog(`${key} = ${value}`);
    }
    return response;
}

function fetchVariables(varmap) {
    const retval = {};
    const errors = _.compact(_.map(varmap, function(f, name) {
        const readv = nconf.get(name);
        if(!readv || !readv.length)
            return "--" + name + " is required";
        
        const lapz = f(readv);
        if(!lapz)
            return "--" + name + " invalid format? " + lapz;
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
    fetchOrganizerId,
    identity_filename: IDENTITY_FILENAME,
    identity_file_path: IDENTITY_PATH,
}
