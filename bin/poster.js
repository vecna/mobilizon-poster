#!/usr/bin/env node
const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('bin:poster');
const nconf = require('nconf');
 
const event = require('../lib/event');
const eposter = require('../lib/createEvent');
const shared = require('../lib/shared');
const location = require('../lib/location');

nconf.argv().env().file({file: "config.json"});

async function poster() {
    
    shared.integrityChecks({
        start: 'When the event begin: Format YYYY-MM-DD HH:mm',
        end: 'When the event ends: Format YYYY-MM-DD HH:mm',
        title: 'Event title',
        description: 'Event description, you should supply the "\n" this way, if any',
        url: 'Event URL, or Facebook URL, or leave it empty with ""',
        address: "You should specify a full address — works: 'Street N, City, Region'"
    });

    const eventvars = shared.fetchVariables({
        start: moment,
        end: moment,
        title: _.toString,
        description: _.toString,
        url: _.toString,
        address: _.toString,
    })

    eventvars.location = await location.queryLocation(eventvars.address);
    debug(eventvars);
   
    await eposter.postToMobilizon(eventvars);
    debug("Posted successfully, now listing the last four Event in the node:");
    await event.fetchLastFourEvents();
}

poster();

module.exports = {
    poster
}
