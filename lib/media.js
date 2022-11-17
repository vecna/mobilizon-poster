const _ = require('lodash');
const fs = require('fs');
const fetch = require('node-fetch');
const debug = require('debug')('mobi:media');
const nconf = require('nconf');

const location = require('./location');

nconf.argv().env().file({file: "config.json"});

/* imported by uploader.sh from allilengyi */

/*
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
*/

async function upload() {

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


module.exports = {
  upload,
}
