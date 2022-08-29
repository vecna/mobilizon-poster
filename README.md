# mobilizon-poster

A simple nodejs script(s) to interact with mobilizon via command line, it also act as a **library** to allow your backend script to interact with mobilizon.
Since August 2022 there is a refactor in progress, and you can pick this script from [npm package](https://www.npmjs.com/package/@_vecna/mobilizon-poster).

This tool has been used in alpha stage in 2021 and gradual improvement are happening. Most of its usecase is with httsp://libr.events

# This is in ALPHA. What's the goal?

* This tool enable a mobilizon user to post in their account. 
* Read [here for usage tips and documentation](https://libr.events/mobilizon-poster).
* become a usable third party tool, available as [npm package](https://www.npmjs.com/package/@_vecna/mobilizon-poster).

# Executables 

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
