const _ = require('lodash');
const nconf = require('nconf');
const debug = require('debug')('mobi:location');

const shared = require('../lib/shared');

nconf.argv().env().file({ file: "config.json" });

async function queryLocation(locationString, localeString, api, authToken) {

    if (api)
        nconf.set('api', api);

    if (!nconf.get('api'))
        nconf.set('api', shared.getServer());

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
        response = await shared.mobilizonHTTPAPIfetch(queryLocation, token);
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

    const rv = responseBody?.data?.searchAddress[0];
    debug(`Available ${responseBody.data.searchAddress.length} locations, selected [${rv.description}](${rv.geom})`);
    return rv;
}

async function location() {
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
