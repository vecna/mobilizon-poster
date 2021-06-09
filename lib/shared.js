const _ = require('lodash');
const nconf = require('nconf');

function integrityChecks(specific={}) {
    debugger;
    /* this function performs integrity checks to verify everything it is ready to work */
    const mandatoryKeys = {
        api: "It is missing the API endpoint (--api), this is mandatory",
        token: "It is missing the Authentication Token, (--token) this is mandatory"
    };
    const docs ="https://quickened.interoperability.tracking.exposed/mobilizon-poster";
    const issues = "https://github.com/vecna/mobilizon-poster/issues";

    _.each(_.extend(mandatoryKeys, specific), function(message, kname) {
        const exists = nconf.get(kname);
        if(_.isUndefined(exists)) {
            console.log(`${kname} missing!  \t${message}`);
            console.log(`Required: ${_.keys(mandatoryKeys)}`)
            console.log(`\n\nTo provide variables like ${kname}, you have three ways: --longopt, environment, or config.json`);
            console.log(`You can check out the documentation here: ${docs}`);
            console.log(`And if this should be different, please raise your point with a ticket: ${issues}`);
            process.exit(1);
        }
    })
}


module.exports = {
    integrityChecks
}