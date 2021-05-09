const _ = require('lodash');
const fs = require('fs');
const fetch = require('node-fetch');
const debug = require('debug')('poster');
const nconf = require('nconf');

const location = require('./location');

nconf.argv().env().file({file: "config.json"});

async function fetchLastFourEvents() {

  const listEvents = `query  {
    events(limit: 4) {
      elements {
        id,
        title,
        url,
        beginsOn,
        endsOn
      },
      total
    }
  }`;
  const response = await fetch(nconf.get('api'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: listEvents 
    }),
  });
  const responseBody = await response.json();
  console.log(JSON.stringify(responseBody, undefined, 2));
}

const createEvent = JSON.parse("{\"query\":\"mutation createEvent($organizerActorId: ID!, $attributedToId: ID, $title: String!, $description: String!, $beginsOn: DateTime!, $endsOn: DateTime, $status: EventStatus, $visibility: EventVisibility, $joinOptions: EventJoinOptions, $draft: Boolean, $tags: [String], $picture: MediaInput, $onlineAddress: String, $phoneAddress: String, $category: String, $physicalAddress: AddressInput, $options: EventOptionsInput, $contacts: [Contact]) {\\n  createEvent(\\n    organizerActorId: $organizerActorId\\n    attributedToId: $attributedToId\\n    title: $title\\n    description: $description\\n    beginsOn: $beginsOn\\n    endsOn: $endsOn\\n    status: $status\\n    visibility: $visibility\\n    joinOptions: $joinOptions\\n    draft: $draft\\n    tags: $tags\\n    picture: $picture\\n    onlineAddress: $onlineAddress\\n    phoneAddress: $phoneAddress\\n    category: $category\\n    physicalAddress: $physicalAddress\\n    options: $options\\n    contacts: $contacts\\n  ) {\\n    id\\n    uuid\\n    title\\n    url\\n    local\\n    description\\n    beginsOn\\n    endsOn\\n    status\\n    visibility\\n    joinOptions\\n    draft\\n    picture {\\n      id\\n      url\\n      __typename\\n    }\\n    publishAt\\n    category\\n    onlineAddress\\n    phoneAddress\\n    physicalAddress {\\n      description\\n      street\\n      locality\\n      postalCode\\n      region\\n      country\\n      geom\\n      type\\n      id\\n      originId\\n      __typename\\n    }\\n    attributedTo {\\n      id\\n      domain\\n      name\\n      url\\n      preferredUsername\\n      avatar {\\n        id\\n        url\\n        __typename\\n      }\\n      __typename\\n    }\\n    organizerActor {\\n      avatar {\\n        id\\n        url\\n        __typename\\n      }\\n      preferredUsername\\n      domain\\n      name\\n      url\\n      id\\n      __typename\\n    }\\n    contacts {\\n      avatar {\\n        id\\n        url\\n        __typename\\n      }\\n      preferredUsername\\n      domain\\n      name\\n      url\\n      id\\n      __typename\\n    }\\n    participantStats {\\n      going\\n      notApproved\\n      participant\\n      __typename\\n    }\\n    tags {\\n      id\\n      slug\\n      title\\n      __typename\\n    }\\n    options {\\n      maximumAttendeeCapacity\\n      remainingAttendeeCapacity\\n      showRemainingAttendeeCapacity\\n      anonymousParticipation\\n      showStartTime\\n      showEndTime\\n      offers {\\n        price\\n        priceCurrency\\n        url\\n        __typename\\n      }\\n      participationConditions {\\n        title\\n        content\\n        url\\n        __typename\\n      }\\n      attendees\\n      program\\n      commentModeration\\n      showParticipationPrice\\n      hideOrganizerWhenGroupEvent\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}");
createEvent.operationName = "createEvent";
createEvent.variables = {                                            
  title: null,
  description: null,
  beginsOn: '2021-01-01T20:30:00.000Z',      
  endsOn: '2021-01-01T23:30:00.000Z',        
  status: 'CONFIRMED',                       
  visibility: 'PUBLIC',                      
  joinOptions: 'FREE',                       
  draft: false,                              
  tags: [],                                  
  onlineAddress: '',                         
  phoneAddress: '',                          
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
    commentModeration: 'CLOSED',          
    showParticipationPrice: false,           
    showStartTime: true,                     
    showEndTime: true                        
  },                                         
  attributedToId: null,                      
  contacts: [],                              
  organizerActorId: '838'                    
};


async function postToMobilizon(eventvars) {
 
    createEvent.variables.beginsOn = eventvars.start.toISOString();
    createEvent.variables.endsOn = eventvars.end.toISOString();
    createEvent.variables.title = eventvars.title;
    createEvent.variables.description = eventvars.description;
    // createEvent.variables.phoneAddress = eventvars.number;
    createEvent.variables.onlineAddress = eventvars.url;
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
    createEvent.variables.physicalAddress = _.omit(eventvars.location, ['__typename']);
    createEvent.variables.tags = eventvars.tags ? eventvars.tags : [];

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
        "body": JSON.stringify(createEvent),
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
        if(!(responseBody.data.createEvent.uuid.length > 0))
            throw new Error("Not created UUID")
    } catch(error) {
        console.log("Error in createEvent =(", error);
        console.log(JSON.stringify(responseBody, undefined, 2));
        process.exit(1);
    }

    const createdUUID = responseBody.data.createEvent.uuid;
    const id = _.parseInt(responseBody.data.createEvent.id);

    if(!_.isInteger(id)) {
        console.log("Not found an integer 'id': error");
        process.exit(1);
    }
    const result = {
        id,
        createdUUID,
        eventURL: responseBody.data.createEvent.url,
        eventvars,
    };
    const fname = "eventlog/" + id + ".event";
    fs.writeFileSync(fname, JSON.stringify(result, undefined, 2), "utf-8");
    console.log("Saved: " + fname);
    console.log("you can delete with 'node deleter.js --event " + id + "'");
    // console.log("you can used --edit " + createdUUID + "to edit"); // still TODO
}

module.exports = {
    postToMobilizon,
    fetchLastFourEvents,
}
