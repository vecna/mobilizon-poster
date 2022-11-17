const _ = require('lodash');
const moment = require('moment');
const nconf = require('nconf');
const debug = require('debug')('mobi:groups');
const fs = require('fs');

const shared = require('./shared');

nconf.argv().env().file({file: "config.json"});

async function groupList(token) {

    const LoggedUserMemberships = {
        "operationName":"LoggedUserMemberships",
        "variables":{"page":1,"limit":30},
        "query":"query LoggedUserMemberships($page: Int, $limit: Int) {\n  loggedUser {\n    id\n    memberships(page: $page, limit: $limit) {\n      total\n      elements {\n        id\n        role\n        actor {\n          id\n          avatar {\n            id\n            url\n            __typename\n          }\n          preferredUsername\n          name\n          domain\n          __typename\n        }\n        parent {\n          id\n          preferredUsername\n          domain\n          name\n          type\n          avatar {\n            id\n            url\n            __typename\n          }\n          organizedEvents {\n            elements {\n              id\n              title\n              picture {\n                id\n                url\n                __typename\n              }\n              __typename\n            }\n            total\n            __typename\n          }\n          __typename\n        }\n        invitedBy {\n          id\n          preferredUsername\n          domain\n          name\n          avatar {\n            id\n            url\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
    };

    try {
        const response = await shared.mobilizoneHTTPAPIfetch(LoggedUserMemberships, token);
        const body = await response.json();
        const memberships = _.get(body, 'data.loggedUser.memberships');
        if(memberships["__typename"] !== "PaginatedMemberList")
            throw new Error("Unexpected wrong format?");

        console.log("This profile is subscribed to", memberships.total, "groups");
        console.log(`The username/groups are (${_.map(memberships.elements, 'parent.preferredUsername')})`);

        return memberships.elements;
    } catch(error) {
        console.log(".json decode error?", error);
        process.exit(1)
    }
}

module.exports = {
    groupList,
}
