#!/bin/bash

#This script updates realm's client with id 7d5f7851-78d2-43f4-ab96-fa3bf6af07e6

SCRIPT_NAME=$(basename -- "$0")

set -e

#Variables Declaration
UPDATE_REALM_CLIENT_URL="$BASE_URL/admin/realms/$CHPQA_REALM_NAME/clients/7d5f7851-78d2-43f4-ab96-fa3bf6af07e6"

#Get Keyclok Admin Access Token using method from imported functions script
KEYCLOAK_ADMIN_ACCESS_TOKEN=$(getKeycloakAdminAccessToken)

#Create new realm
UPDATE_REALM_CLIENT=$(curl -s -L -X PUT "$UPDATE_REALM_CLIENT_URL" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $KEYCLOAK_ADMIN_ACCESS_TOKEN" \
--data-raw '{
	"redirectUris" : [ "'$CHPQA_API_APP_URL'" ],
	"webOrigins": ["'$CHPQA_API_APP_URL'", "'$CHPQA_WEB_APP_URL'"],
	"secret" : "'$CHPQA_API_CLIENT_SECRET'"
}')

if [ -z "$UPDATE_REALM_CLIENT" ]
then
	echo " $SCRIPT_NAME executed successfully"
else
	echo " $SCRIPT_NAME failed $UPDATE_REALM_CLIENT"
fi
