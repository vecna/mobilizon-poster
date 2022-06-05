#!/bin/bash -eu
# delete anonymous participant. Workaround for issue https://framagit.org/framasoft/mobilizon/-/issues/356

gql='mutation {leaveEvent(actorId: 1, eventId: 239, token: "JICFtENO5tBwhhdio5iW_M-3f4sgIrghkk1lF-mU"){id}}'

MOBILIZON_EP=$(jq '.api' config.json)

curl -sS \
  -H 'accept: application/json' \
  -F "query=${gql}" \
  "${MOBILIZON_EP//\"/}"

