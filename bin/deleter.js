#!/usr/bin/env node
const _ = require('lodash');
const fetch = require('node-fetch');
const debug = require('debug')('bin:deleter');
const nconf = require('nconf');

const shared = require('../lib/shared');

nconf.argv().env().file({file: "config.json"});

async function deleter() {
    shared.integrityChecks({'event':'required the numeric unique identified of as --event'});
    const payload = {
      operationName: 'DeleteEvent',                        
      variables: {
        eventId: nconf.get('event')
      },
      query: 'mutation DeleteEvent($eventId: ID!) {\n  deleteEvent(eventId: $eventId) {\n    id\n    __typename\n  }\n}\n'
    };
    const token = await shared.getToken();
    const response = await shared.mobilizoneHTTPAPIfetch(
      payload,
      token
    );
    const d = await response.json();
    console.log(d);
    return d;
}

deleter();

module.exports = {
  deleter
}