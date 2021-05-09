const poster = require('./poster');
const _ = require('lodash');
const debug = require('debug')('mobilizon-ical-poster');
 
const ical = require('ical');
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const shared = require('./shared');

const fs = require('fs');
const fname = "./1599.ics";
debug("Opening file %s", fname);
const content = fs.readFileSync(fname, 'utf-8')
const data = ical.parseICS(content);

// console.log(_.sample(data));

const results = _.map(data, async function(edata, eventid) {
    if(edata.status !== "CONFIRMED") {
        debug("Skipping event %s", edata.summary);
        return false;
    }

    debug("Sending event %s", edata.summary);
    await poster.postToMobilizon({
        start: edata.start,
        end: edata.end,
        title: edata.summary,
        description: edata.description,
        address: edata.location,
        url: edata.url.val,
        location: null, // TODO
        tags: [ "radar.squat" ],
    });
});

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