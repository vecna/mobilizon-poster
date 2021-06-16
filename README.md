# mobilizon-poster

A simple nodejs script(s) to interact with mobilizon via command line.

It grows _organically_ it means it might not follow a precise and robust development pattern. You should consider this is an alpha stage working prototype.

## This tool enable a mobilizon user to post in their account. 

Read [here for usage tips and documentation](https://quickened.interoperability.tracking.exposed/mobilizon-poster).

We should separate the tool from the groups managed by individual, if you want to keep a small list:

- https://mobilize.berlin/@radarsquatnet\_repost
- https://mobilize.berlin/@facebook\_repost
- [add yours via PR]

## bin/poster 

this is the tool that post events in mobilizone

## bin/deleter

this delete an event previously submit by 'poster'

## bin/ical 

this tool read from an ical event and call 'poster' as many time as events found

## bin/login 

this is the tool that perform access to mobilizon server and save the authentication token, so the other tools can use it.

## bin/group-list

--- 

## renamer (not yet implemented)

This tool rename a group, so it should be used when a "— unofficial" group become renamed.

## uploader (not yet implemented)

A picture should be uploaded separately and then linked to the event. It is a task that require a dedicated tool.


# Configuration variables

## Location 

node bin/poster.js --start "2021-05-09 10:22" --end "2021-05-09 11:22" --title "Test event new structure" --description "blah blah" --url "nothing" --location "Moritzplatz, Berlin, Germany
