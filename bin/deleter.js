#!/usr/bin/env node
const _ = require('lodash');
const fetch = require('node-fetch');
const nconf = require('nconf');

nconf.argv().env().file({file: "config.json"});

async function deleter() {
    const shared = require('../lib/shared');
    shared.integrityChecks({'event':'required the numberic unique identified of as --event'});
    return await fetch(nconf.get('api'), {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": "Bearer " + nconf.get('token'),
        "cache-control": "no-cache",
        "content-type": "application/json",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1"
      },
      "referrerPolicy": "same-origin",
      "body": "{\"operationName\":\"DeleteEvent\",\"variables\":{\"eventId\":\""+nconf.get('event')+"\"},\"query\":\"mutation DeleteEvent($eventId: ID!) {\\n  deleteEvent(eventId: $eventId) {\\n    id\\n    __typename\\n  }\\n}\\n\"}",
      "method": "POST",
      "mode": "cors"
    }).then(async function(response) {
        const d = await response.json();
        console.log(d);
        return d;
    });
}

module.exports = {
    deleter
}
