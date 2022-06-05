#!/usr/bin/env node
const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('bin:poster');
const nconf = require('nconf');
 
const event = require('../lib/event');
const shared = require('../lib/shared');
const location = require('../lib/location');

nconf.argv().env().file({file: "config.json"});

async function showEvents() {
       await event.fetchLastFourEvents();
}

showEvents();
