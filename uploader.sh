#!/bin/bash -eu
# upload media to mobilizomn instance

echo "Please remove the file identities.json and restart the 'login' process; something changed into the internal format in the version 1.1.x"

gql='mutation($file: Upload!, $name:String!){uploadMedia(name: $name, file: $file, alt:null){id}}'

BEARER=`cat .identities.json | jq '.[0].token'`
if [ -z $BEARER ]; then
   echo 'Error in extracting the token!'
fi

# Note, not the login process might register more than one server in identities
MOBILIZON_EP=$(jq '.api' config.json)

printf -v vars '{ "name" : "%s", "file": "thefile" }' $1

curl -sS \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${BEARER//\"/}" \
  -F "query=${gql}" \
  -F "variables=${vars}" \
  -F "thefile=@${2}" \
  "${MOBILIZON_EP//\"/}"

