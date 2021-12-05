#!/bin/bash -eu
# upload media to mobilizomn instance

gql='mutation($file: Upload!, $name:String!){uploadMedia(name: $name, file: $file, alt:null){id}}'

BEARER=$(jq '.token' identities.json) 

MOBILIZON_EP=$(jq '.api' config.json)

printf -v vars '{ "name" : "%s", "file": "thefile" }' $1

curl -sS \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${BEARER//\"/}" \
  -F "query=${gql}" \
  -F "variables=${vars}" \
  -F "thefile=@${2}" \
  "${MOBILIZON_EP//\"/}"

