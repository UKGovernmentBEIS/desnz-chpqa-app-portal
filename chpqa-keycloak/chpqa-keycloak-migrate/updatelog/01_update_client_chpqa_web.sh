#!/bin/bash

#This script updates realm's client with id 0e3b0a7e-224e-4cde-b239-ae6849d3b8bd

SCRIPT_NAME=$(basename -- "$0")

set -e

#Variables Declaration
UPDATE_REALM_CLIENT_URL="$BASE_URL/admin/realms/$CHPQA_REALM_NAME/clients/0e3b0a7e-224e-4cde-b239-ae6849d3b8bd"

#Get Keyclok Admin Access Token using method from imported functions script
KEYCLOAK_ADMIN_ACCESS_TOKEN=$(getKeycloakAdminAccessToken)

#Create new realm
UPDATE_REALM_CLIENT=$(curl -s -L -X PUT "$UPDATE_REALM_CLIENT_URL" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $KEYCLOAK_ADMIN_ACCESS_TOKEN" \
--data-raw '{
	"redirectUris": ["'$CHPQA_WEB_APP_LOCALHOST_URL'/*", "'$CHPQA_WEB_APP_URL'/*"],
	"baseUrl": "'$CHPQA_WEB_APP_URL'",
	"adminUrl": "'$CHPQA_WEB_APP_URL'",
	"webOrigins": ["'$CHPQA_WEB_APP_LOCALHOST_URL'", "'$CHPQA_WEB_APP_URL'"]
}')

if [ -z "$UPDATE_REALM_CLIENT" ]
then
	echo " $SCRIPT_NAME executed successfully"
else
	echo " $SCRIPT_NAME failed $UPDATE_REALM_CLIENT"
fi
