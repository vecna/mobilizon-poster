#!/usr/bin/env node
const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('bin:poster');
const nconf = require('nconf');
 
const event = require('../lib/createEvent');
const shared = require('../lib/shared');
const location = require('../lib/location');

nconf.argv().env().file({file: "config.json"});

async function poster() {
    
    path = process.argv[2];
    const eventvars = require(path);
    eventvars.location = await location.queryLocation(eventvars.address);
    eventvars.start = moment(eventvars.start);
    if (eventvars.end) {
      eventvars.end = moment(eventvars.end);
    }
    debug(eventvars);
   
    await event.postToMobilizon(eventvars);
    debug("Posted successfully, now listing the last four Event in the node:");

}

poster();

module.exports = {
  happening: poster
}