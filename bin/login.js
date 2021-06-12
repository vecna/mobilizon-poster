#!/usr/bin/env node
const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('bin:login');
const nconf = require('nconf');
const fs = require('fs');
 
const shared = require('../lib/shared');
const login = require('../lib/login');

nconf.argv().env().file({file: "config.json"});

async function connectAndSaveTokens() {
    
    shared.integrityChecks({
        login: '<login>',
        password: '<password>',
    });

    const eventvars = shared.fetchVariables({
        login: _.toString,
        password: _.toString,
    })

    const token = await login.perform(eventvars);
    // remind, this process THROW AWAY the refreshToken as still is unclear when it should be used
    debug("retrived authentication token! ");

    const accountInfo = await login.getInfo(token);

    debug("Saving token and account info in identities.json file; this would be used as default");
    const content = {
        identities: accountInfo,
        token,
    };
    fs.writeFileSync("identities.json", JSON.stringify(content, undefined, 2), 'utf-8');
    console.log("Saved authentication token in identities.json");
}

connectAndSaveTokens();
