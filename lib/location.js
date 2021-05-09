const _ = require('lodash');
const fs = require('fs');
const moment = require('moment');
const fetch = require('node-fetch');
const nconf = require('nconf');
const debug = require('debug')('lib:location');
const path = require('path');

nconf.argv().env().file({file: "config.json"});

async function queryLocation(locationString, localeString) {

    const queryLocation = { query: 'query ($query: String!, $locale: String, $type: AddressSearchType) {\n  ' +
        'searchAddress(query: $query, locale: $locale, type: $type) {\n    id\n   ' +
        ' description\n    geom\n    street\n    locality\n    postalCode\n    ' +
        'region\n    country\n    type\n    url\n    originId\n    __typename\n  }\n}' };

    // note, seems mobilizon web client isn't setting this, I saw it as null
    queryLocation.operationName = null; // "AddressSearchType";
    queryLocation.variables = {                                            
        query: locationString,
        locale: localeString ? localeString : 'en',
    };

    const response = await fetch(nconf.get('api'), {
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
        "body": JSON.stringify(queryLocation),
        "method": "POST",
        "mode": "cors"
    });

    let responseBody = null;
    try {
        responseBody = await response.json();
    } catch(error) {
        console.log(".json decode error?", error);
        process.exit(1)
    }

    try {
        if(!(responseBody.data.searchAddress.length > 0)) {
            console.log("Not found any place with that name");
            process.exit();
        }
    } catch(error) {
        console.log("Error in fetching location =(", error);
        console.log(JSON.stringify(responseBody, undefined, 2));
        process.exit(1);
    }

    console.log(`Fetched ${responseBody.data.searchAddress.length} possible locations, picking the first`);
    try {
        saveLocation(responseBody.data.searchAddress, locationString);
        updateList(responseBody.data.searchAddress[0], locationString);
    } catch(error) {
        console.log(`Error: ${error.message} ${error.code}`);
        process.exit(1);
    }
    return responseBody.data.searchAddress[0];
}

function saveLocation(data, name) {
    const fname = path.join('eventlog', 'noisy', name + '.json') 
    fs.writeFileSync(fname, JSON.stringify(data, undefined, 2), { encoding: "utf-8", flag: 'w+'});
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
