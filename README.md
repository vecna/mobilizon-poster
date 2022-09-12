# mobilizon-poster

A simple library to interact with [joinmobilizone.org](https://joinmobilizone.org), you can clone it from [https://github.com/vecna/mobilizon-poster](https://github.com/vecna/mobilizon-poster).

It also works as a set of scripts to help a CLI interaction with mobilizon, but it is largely under-developed.

# basic functions

To post an event you need to call a sequence of mobilizone APIs, for example: you need to authenticate, then to resolve the location of your event, then to create an event.

Mobilizon revolves around the concept of `groups` and this is not entrirely (if not at all) supported in this package.

Below it follow the sequence of actions given:

```
const login = require('@_vecna/mobilizon-poster').lib.login;

const username = "username";
const password = "password";
const api = "https://mobilizone-instance.xxx/api"; // note the api at the end

const token = await login.perform({ login: username, password, api });
const userInfo = await login.getInfo(token);
```

if you are using the script `bin/login.js` it would save this token into a file named `.identities.json` but if your code, you should depack `userInfo` and save the `id` because it is necessary when you post new events!

the `userInfo` depacked contains these fields:

```
"identities": [
  {
    "__typename": "Person",
    "avatar": {
      "__typename": "Media",
      "id": "2b494db8-9bbd-40bc-a88d-e3edc3f9495a",
      "url": "https://mobilizon.libr.events/media/3c9a553c4f789c64f25db8a03a8299f91479bac1050e7e2c2cd4c99f97313a71.png?name=Screenshot%20from%202022-08-12%2013-35-10.png"
    },
    "id": "4",
    "name": "xxxx@xxxx.xxx",
    "preferredUsername": "ManyExes",
    "type": "PERSON"
  }
```

#### After you have the token and the `id`, you can post the events:

```

const createEvent = require('@_vecna/mobilizon-poster').lib.createEvent;
const location = require('@_vecna/mobilizon-poster').lib.location;

const eventvars = {
  start: new Date(), // the object need to have a valid .toISOString() method
  end: new Date(),   // this can be null, and
  title: "Event title!",
  description: "A description that should also contains\n\nnewlines",
  url: "https://your.event.promotion.or.anything.else",
  address: "A string that would be queried soon!",
};

eventvars.location = await location.queryLocation(
  eventvars.address, localString=null, apiEndpoint
);

/* for authorization */
eventvars.token = token;
eventvars.organizerActorId = userInfo.identities[0].id;

eventvars.tags = [ "a list of tags" ]; // by default it says "unofficial"

const results = await createEvent.postToMobilizon(eventvars);
```

if you print `eventvars.location` you'll find an OpenStreetMap object like this, when the string is "Berlin, c-base":

```
lib:location Fetched 1 possible locations, the first is: +0ms
lib:location {
lib:location   __typename: 'Address',
lib:location   country: 'Germany',
lib:location   description: 'c-base',
lib:location   geom: '13.4201313;52.5129735',
lib:location   id: null,
lib:location   locality: 'Berlin',
lib:location   originId: 'nominatim:260050809',
lib:location   postalCode: '10179',
lib:location   region: null,
lib:location   street: '20 Rungestraße',
lib:location   type: 'house',
lib:location   url: null
lib:location } +0ms
```

Inside of the `results` variable you should find also `url`, the link at the event just generated.

P.S: execute this codes with `DEBUG=*` would enable a verbose I/O reporting.

## Why has been developed

* This tool enable a mobilizon user to post in their account. 
* Read [here for usage tips and documentation](https://libr.events/mobilizon-poster).
* become a usable third party tool, available as [npm package](https://www.npmjs.com/package/@_vecna/mobilizon-poster).

# Executables 

The simplest example is:

```
$ bin/login.js --login username@mail --password xxxyyyzzz --api https://mobilizon.libr.events/api
```

This create a file named `.identities.json`.

```
$ bin/poster.js --start 2022-08-03 --end 2022-08-03 --title "TEST-ignore-me" --description "a description" --url "https://an.url.of.the.event" --address "berlin, c-base" --api https://mobilizon.libr.events/api
```

### bin/poster 

this is the tool that post events in mobilizone

### bin/postEvent

this is the tool to create an Event on a mobilizon instance using a json file as input.
Usage: `node bin/postEvent.js /absolute/path/to/jile.json`
As json keys are expected:

```
{
  "start": "YYYY-MM-DD HH:mm",
  "end": null or "YYYY-MM-DD HH:mm",
  "title": "$string",
  "description": "$string",
  "address": "$string",
  "url": "$url",
  "picture": {
    "media_id": "$idFromUploader.sh"
  },
  "organizer_id": "$id",
  "attributed_to_id": "$id"
}
```

### bin/deleter

this delete an event previously submit by 'poster'

### bin/ical 

this tool read from an ical event and call 'poster' as many time as events found

### bin/login 

this is the tool that perform access to mobilizon server and save the authentication token, so the other tools can use it.
Usage: `node bin/login.js --login=$login --password=$password`

### bin/group-list

--- 

## renamer (not yet implemented)

This tool rename a group, so it should be used when a "— unofficial" group become renamed.

## uploader (not yet implemented)

A picture should be uploaded separately and then linked to the event. It is a task that require a dedicated tool.


# Configuration variables / example

all of these command needs a `apiUrl` variable, or an `--api` option in the command line to specify a mobilizone server

## Location resolved

```
node bin/location.js --address "Moritzplatz, Berlin, Germany"
```

## Event Poster

```
node bin/poster.js --start "2021-05-09 10:22" --end "2021-05-09 11:22" --title "Test event new structure" --description "blah blah" --url "nothing" --address "Moritzplatz, Berlin, Germany"
```

# Libraries

```
createEvent.postToMobilizon
event.fetchLastFourEvents
groups.groupList
location.location
location.queryLocation
login.perform
login.getInfo
shared.integrityChecks
shared.mobilizoneHTTPAPIfetch
shared.fetchVariables
shared.getToken
upload.uploadToMobilizon
```


## To run the tests

To set up the local Mobilizon instance, please have [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/) installed. The integration tests expect a running instance of mobilizon available. 

To run the Mobilizon install inside docker:

```docker-compose -f docker-compose-test.yml```

To run the test suites:

```npm tests```