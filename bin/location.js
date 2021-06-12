#!/usr/bin/env node
const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('bin:location');
const nconf = require('nconf');
 
const shared = require('../lib/shared');
const location = require('../lib/location');

nconf.argv().env().file({file: "config.json"});

async function locationResolver() {
    
    shared.integrityChecks({
        address: "You should specify a full address — works: 'Street N, City, Region'"
    });

    const eventvars = shared.fetchVariables({
        address: _.toString,
    })

    eventvars.location = await location.queryLocation(eventvars.address);
    debug(eventvars);
   
}

locationResolver();
