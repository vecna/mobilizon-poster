#!/usr/bin/env node
const _ = require('lodash');
const debug = require('debug')('mobilizon-ical-poster');
const ical = require('ical');
const nconf = require('nconf');
const fs = require('fs');

const event = require('../lib/event');
const shared = require('../lib/shared');

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

nconf.argv().env().file({file: "config.json"});

async function processcal() {
    shared.integrityChecks({'ics': '--ics is the downloaded calendar file to be posted'})
    const fname = nconf.get('ics');
    debug("Opening ICAL file %s", fname);
    const content = fs.readFileSync(fname, 'utf-8')
    const data = ical.parseICS(content);

    const results = _.map(data, async function(edata, eventid) {
        if(edata.status !== "CONFIRMED") {
            debug("Skipping event %s", edata.summary);
            return false;
        }
        debug("Sending event %s", edata.summary);
        const ret = await event.postToMobilizon({
            start: edata.start,
            end: edata.end,
            title: edata.summary,
            description: edata.description,
            address: edata.location,
            url: edata.url.val,
            tags: [ "radar.squat" ],
        });
        debug("Completed: %s", ret);
    });

}

processcal();

/*
for (let k in data) {
    if (data.hasOwnProperty(k)) {
        var ev = data[k];
        if (data[k].type == 'VEVENT') {
            // console.log(JSON.stringify(data, undefined, 2));
            // console.log(`${ev.summary} is in ${ev.location} on the ${ev.start.getDate()} of ${months[ev.start.getMonth()]} at ${ev.start.toLocaleTimeString('en-GB')}`);

        }
    }
} */
