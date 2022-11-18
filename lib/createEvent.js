const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const debug = require('debug')('mobi:poster');
const nconf = require('nconf');
const moment = require('moment');

const shared = require('./shared');

nconf.argv().env().file({file: "config.json"});

function initEvent() {
    /* this creates the default, as you can see the tag
     * "unofficial" is hardcoded here and should not be so */
    const createEvent = JSON.parse("{\"query\":\"mutation createEvent($organizerActorId: ID!, $attributedToId: ID, $title: String!, $description: String!, $beginsOn: DateTime!, $endsOn: DateTime, $status: EventStatus, $visibility: EventVisibility, $joinOptions: EventJoinOptions, $draft: Boolean, $tags: [String], $picture: MediaInput, $onlineAddress: String, $phoneAddress: String, $category: EventCategory, $physicalAddress: AddressInput, $options: EventOptionsInput, $contacts: [Contact]) {\\n  createEvent(\\n    organizerActorId: $organizerActorId\\n    attributedToId: $attributedToId\\n    title: $title\\n    description: $description\\n    beginsOn: $beginsOn\\n    endsOn: $endsOn\\n    status: $status\\n    visibility: $visibility\\n    joinOptions: $joinOptions\\n    draft: $draft\\n    tags: $tags\\n    picture: $picture\\n    onlineAddress: $onlineAddress\\n    phoneAddress: $phoneAddress\\n    category: $category\\n    physicalAddress: $physicalAddress\\n    options: $options\\n    contacts: $contacts\\n  ) {\\n    id\\n    uuid\\n    title\\n    url\\n    local\\n    description\\n    beginsOn\\n    endsOn\\n    status\\n    visibility\\n    joinOptions\\n    draft\\n    picture {\\n      id\\n      url\\n      __typename\\n    }\\n    publishAt\\n    category\\n    onlineAddress\\n    phoneAddress\\n    physicalAddress {\\n      description\\n      street\\n      locality\\n      postalCode\\n      region\\n      country\\n      geom\\n      type\\n      id\\n      originId\\n      __typename\\n    }\\n    attributedTo {\\n      id\\n      domain\\n      name\\n      url\\n      preferredUsername\\n      avatar {\\n        id\\n        url\\n        __typename\\n      }\\n      __typename\\n    }\\n    organizerActor {\\n      avatar {\\n        id\\n        url\\n        __typename\\n      }\\n      preferredUsername\\n      domain\\n      name\\n      url\\n      id\\n      __typename\\n    }\\n    contacts {\\n      avatar {\\n        id\\n        url\\n        __typename\\n      }\\n      preferredUsername\\n      domain\\n      name\\n      url\\n      id\\n      __typename\\n    }\\n    participantStats {\\n      going\\n      notApproved\\n      participant\\n      __typename\\n    }\\n    tags {\\n      id\\n      slug\\n      title\\n      __typename\\n    }\\n    options {\\n      maximumAttendeeCapacity\\n      remainingAttendeeCapacity\\n      showRemainingAttendeeCapacity\\n      anonymousParticipation\\n      showStartTime\\n      showEndTime\\n      offers {\\n        price\\n        priceCurrency\\n        url\\n        __typename\\n      }\\n      participationConditions {\\n        title\\n        content\\n        url\\n        __typename\\n      }\\n      attendees\\n      program\\n      commentModeration\\n      showParticipationPrice\\n      hideOrganizerWhenGroupEvent\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}");
    createEvent.operationName = "createEvent";
    createEvent.variables = {                                            
        title: "",
        description: "",
        beginsOn: null,
        endsOn: null,
        status: 'CONFIRMED',
        category: 'MEETING',
        visibility: 'PUBLIC',
        joinOptions: 'FREE',
        draft: false,
        tags: ['unofficial'],
        onlineAddress: '',
        phoneAddress: '',
        physicalAddress: null,
        options: {                                 
            maximumAttendeeCapacity: 0,              
            remainingAttendeeCapacity: 0,            
            showRemainingAttendeeCapacity: false,    
            anonymousParticipation: true,           
            hideOrganizerWhenGroupEvent: false,      
            offers: [],                              
            participationConditions: [],             
            attendees: [],                           
            program: '',                             
            commentModeration: 'ALLOW_ALL',          
            showParticipationPrice: false,           
            showStartTime: true,                     
            showEndTime: true                        
        },                                         
        metadata: [],
        attributedToId: null,
        contacts: [],
        organizerActorId: "MANDATORY_TO_BE_SET_BELOW!"
    };

    return createEvent;
}


async function postToMobilizon(eventvars) {
   /* console.log(eventvars.location)
    < {
    <   __typename: 'Address',
    <   country: 'Germany',
    <   description: 'Moritzplatz',
    <   geom: '13.41071326337746;52.5036427',
    <   id: null,
    <   locality: 'Berlin',
    <   originId: 'nominatim:441641842',
    <   postalCode: '10969',
    <   region: 'Berlin',
    <   street: ' ',
    <   type: 'square',
    <   url: null
    < } */
    const createEvent = initEvent();

    createEvent.variables.beginsOn = eventvars.start.toISOString();
    if (eventvars.end) {
      createEvent.variables.endsOn = eventvars.end.toISOString();
    }
    createEvent.variables.title = eventvars.title;
    createEvent.variables.description = eventvars.description;
    createEvent.variables.onlineAddress = eventvars.url;
    createEvent.variables.physicalAddress = _.omit(eventvars.location, ['__typename']);
    if (eventvars?.picture?.media_id) {
      createEvent.variables.picture = eventvars.picture;
    }
    createEvent.variables.organizerActorId = eventvars.organizerActorId ?? shared.fetchOrganizerId();
    createEvent.variables.attributedToId = null; // eventvars.attributed_to_id ?? shared.fetchOrganizerId();
    createEvent.variables.tags = eventvars.tags ? eventvars.tags : ['unofficial'];

    // debug("Event ready to be posted as: %j", createEvent.variables);

    // debug("Picking token from:", eventvars.token ? "parameters" : "local cache");
    const token = eventvars.token ? eventvars.token : shared.getToken();

    const response = await fetch(nconf.get('api'), {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "authorization": "Bearer " + token,
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1"
        },
        "referrerPolicy": "same-origin",
        "body": JSON.stringify(createEvent),
        "method": "POST",
        "mode": "cors"
    });

    let responseBody = null;
    try {
        responseBody = await response.json();
    } catch(error) {
        debug("Decoding JSON from createEvent %s", error.message);
        debug("Response HTTP status: %d", responseBody.status);
        throw error;
    }

    if(responseBody?.message === 'invalid_token')
        throw new Error("Invalid Token!");

    if(responseBody?.errors)
        throw new Error(JSON.stringify(_.map(responseBody.errors, 'message')));

    const created = responseBody.data.createEvent;
    const createdUUID = created.uuid;
    const id = _.parseInt(created.id);

    if(!_.isInteger(id)) {
        debug("Not found an integer 'id': error [%s]", id);
        throw new Error("Unexpected inconsistency: not found an event Id");
    }

    debug("Successful event created: %O", created);

    if(eventvars.saveFile) {
        const result = {
            id,
            createdUUID,
            eventURL: created.url,
            eventvars,
        };
        console.log(`Event created at: ${created.url}`);
        const fname = path.join('eventlog', `${id}.event`);
        fs.writeFileSync(fname, JSON.stringify(result, undefined, 2), "utf-8");
        debug("Saved: %s", fname);
        debug("you can delete with 'node deleter.js --event %s'", id);
        // console.log("you can used --edit " + createdUUID + "to edit"); // still TODO
    }

    return created;
}

module.exports = {
    postToMobilizon,
    initEvent,
}
