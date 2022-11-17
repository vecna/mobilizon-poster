const _ = require('lodash');
const fs = require('fs');
const fetch = require('node-fetch');
const debug = require('debug')('mobi:event');
const nconf = require('nconf');

const location = require('./location');

nconf.argv().env().file({file: "config.json"});

async function fetchLastFourEvents() {

  const listEvents = `query  {
    events(limit: 4) {
      elements {
        id,
        title,
        description,
        url,
        beginsOn,
        endsOn,
        picture {
          url
        }
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
  status: 'TENTATIVE',                       
  visibility: 'PRIVATE',                      
  joinOptions: 'FREE',                       
  draft: true,                              
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
  picture: {
    media_id: 103
  },
  attributedToId: 101,                      
  contacts: [],                              
  organizerActorId: '3'                    
};


module.exports = {
  fetchLastFourEvents,
}
