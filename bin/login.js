#!/usr/bin/env node
const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('bin:login');
const nconf = require('nconf');
const fs = require('fs');
 
const shared = require('../lib/shared');
const login = require('../lib/login');

nconf.argv().env()

async function connectAndSaveTokens() {
    
    shared.integrityChecks({
        email: '<email>',
        password: '<password>',
    });

    const eventvars = shared.fetchVariables({
        email: _.toString,
        password: _.toString,
        api: _.toString,
    })

    const token = await login.perform(eventvars.email, eventvars.password, eventvars.api);
    // the token expire quite often, so a new login every time, 
    // before posting, would be necessary.
    debug("retrived authentication token! ");

    const accountInfo = await login.getInfo(token);

    let existing = [];
    try {
        const data = fs.readFileSync(shared.identity_filename, 'utf-8');
        existing = JSON.parse(data);
        debug(`Loaded existing ${existing.length} identities, servers: [${_.map(existing, 'server')}]`);
    } catch(error) {
        debug(`file ${shared.identity_filename} not found`);
    }

    const newcontent = _.reject(existing, {server: nconf.get('api')});
    debug(`Saving token and account info in ${shared.identity_filename} file; this would be used as default`);

    newcontent.push({
        identities: accountInfo,
    	server: nconf.get('api'),
    	date: moment().toISOString(),
        token,
    });

    fs.writeFileSync(shared.identity_filename,
        JSON.stringify(newcontent, undefined, 2), 'utf-8');
    console.log(`Saved authentication token in ${shared.identity_filename}. servers supported: [${_.map(newcontent, 'server')}]`);
}

connectAndSaveTokens();

module.exports = {
    connectAndSaveTokens
}
