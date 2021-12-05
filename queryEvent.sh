#!/bin/bash -eu

gql='{ event (uuid: "4915121d-3f81-4553-b35f-1984f0e4179d") { tags [Tag] , id, title} }'

MOBILIZON_EP="https://mobilize.berlin/api"

curl -sS \
  -H 'accept: application/json' \
  -F "query=${gql}" \
  "${MOBILIZON_EP//\"/}"

