const _ = require('lodash');
const fs = require('fs');
const moment = require('moment');
const fetch = require('node-fetch');
const nconf = require('nconf');
const debug = require('debug')('lib:location');
const path = require('path');

const shared = require('../lib/shared');

nconf.argv().env().file({ file: "config.json" });

async function queryLocation(locationString, localeString, api, authToken) {

    if (api)
        nconf.set('api', api);

    const queryLocation = {
        query: 'query ($query: String!, $locale: String, $type: AddressSearchType) {\n  ' +
            'searchAddress(query: $query, locale: $locale, type: $type) {\n    id\n   ' +
            ' description\n    geom\n    street\n    locality\n    postalCode\n    ' +
            'region\n    country\n    type\n    url\n    originId\n    __typename\n  }\n}'
    };

    // Note, seems mobilizon web client isn't setting this, I saw it as null
    queryLocation.operationName = null; // "AddressSearchType";
    queryLocation.variables = {
        query: locationString,
        locale: localeString ? localeString : 'en',
    };

    debug("Picking token from: ", authToken ? "parameters" : "local cache");
    const token = authToken ? authToken : shared.getToken();

    let response = null, responseBody = null;
    try {
        response = await shared.mobilizoneHTTPAPIfetch(queryLocation, token);
        responseBody = await response.json();
    } catch (error) {
        debug("HTTP status %d - Error in fetching location: %j", response.status, error);
        throw error;
    }

    if (responseBody?.message === 'invalid_token')
        throw new Error("Invalid Token!");

    if (!(responseBody.data.searchAddress.length > 0)) {
        debug("%s", JSON.stringify(responseBody, undefined, 2));
        throw new Error("Not found any place with the location/name");
    }

    debug(`Fetched ${responseBody.data.searchAddress.length} possible locations, the first is: ${JSON.stringify(responseBody.data.searchAddress[0], null, 2)}`);

    try {
        saveLocation(responseBody.data.searchAddress, locationString);
        updateList(responseBody.data.searchAddress[0], locationString);
    } catch (error) {
        debug(`(acceptable) error in saving location cache: ${error.message} ${error.code}`);
    }
    return responseBody.data.searchAddress[0];
}

function saveLocation(data, name) {
    const dirdest = path.join('eventlog', 'noisy');S
    if(!fs.existsSync(dirdest))
        return;
    const fname = path.join('eventlog', 'noisy', name + '.json')
    fs.writeFileSync(fname, JSON.stringify(data, undefined, 2), { encoding: "utf-8", flag: 'w+' });
    debug("Written file %s with %d locations", fname, _.size(data));
}

function updateList(data, name) {
    const fname = path.join('eventlog', 'all-locations.json');
    fs.writeFileSync(fname, new Date() + " " + name + " " + JSON.stringify(data, undefined, 1), {
        encoding: "utf-8", flag: 'a+'
    });
    debug("Appended file %s with location for %s", fname, name);
}

async function location() {
    const shared = require('./shared');
    shared.integrityChecks({
        address: "You should specify a full address — works: 'Street N, City, Region'",
    });
    const location = await queryLocation(nconf.get('address'));
    /* {
           "country":"Italy",
           "description":"Via Balsorano",
           "geom":"12.67513624920975;41.91885223378078",
           "id":null,
           "locality":"Rome",
           "originId":"nominatim:28084686",
           "postalCode":"00132",
           "region":"Lazio",
           "street":" ",
           "type":"residential",
           "url":null
       }; */
    return location;
}

module.exports = {
    queryLocation,
    location,
}
