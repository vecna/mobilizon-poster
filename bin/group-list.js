#!/usr/bin/env node
const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('bin:group-list');
const nconf = require('nconf');
const fs = require('fs');

const shared = require('../lib/shared');
const groups = require('../lib/groups');

nconf.argv().env().file({file: "config.json"});

async function queryGroupList() {
   
    const token = await shared.getToken();
    debug("Querying server %s to get group list", nconf.get('api'));
    const elements = await groups.groupList(token);

    fs.writeFileSync('groups.json', JSON.stringify(elements, undefined, 2), 'utf-8');
    console.log("Saved in groups.json; now you can use them as option to post there");
}

queryGroupList();

module.exports = {
    queryGroupList,
}