#!/usr/bin/env node
const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('mobilizon-poster');
const nconf = require('nconf');
 
const event = require('../lib/event');
const shared = require('../lib/shared');
const location = require('../lib/location');

nconf.argv().env().file({file: "config.json"});

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

async function poster() {
    
    shared.integrityChecks({
        start: 'When the event begin: Format YYYY-MM-DD HH:mm',
        end: 'When the event ends: Format YYYY-MM-DD HH:mm',
        title: 'Event title',
        description: 'Event description, you should supply the "\n" this way, if any',
        url: 'Event URL, or Facebook URL, or leave it empty with ""',
        address: "You should specify a full address — works: 'Street N, City, Region'"
    });

    const eventvars = fetchVariables({
        start: moment,
        end: moment,
        title: _.toString,
        description: _.toString,
        url: _.toString,
        address: _.toString,
    })

    eventvars.location = await location.queryLocation(eventvars.address);
    debug(eventvars);
   
    await event.postToMobilizon(eventvars);
    debug("Posted successfully, now listing the last four Event in the node:");
    await event.fetchLastFourEvents();
}

poster();
