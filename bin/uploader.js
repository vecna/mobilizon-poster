#!/usr/bin/env node
const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('bin:poster');
const nconf = require('nconf');
 
const upload = require('../lib/upload');
const shared = require('../lib/shared');
const location = require('../lib/location');

nconf.argv().env().file({file: "config.json"});

async function uploader() {
    
    shared.integrityChecks({
        path: 'Provide path to file to upload',
        name: 'Some name for the file'
    });

    const filevars = shared.fetchVariables({
        path: _.toString,
        name: _.toString
    })

    debug(filevars);
   
    await upload.uploadToMobilizon(filevars);
    debug("Uploaded successfully?");
}

uploader();

module.exports = {
    uploader
}