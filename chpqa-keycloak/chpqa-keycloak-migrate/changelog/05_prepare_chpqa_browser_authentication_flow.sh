#!/bin/bash

#This script creates an authentication flow for CHPQA realm as a copy from default browser flow.

SCRIPT_NAME=$(basename -- "$0")

set -e

#Variables Declaration
UPDATE_REALM_URL="$BASE_URL/admin/realms/"

#Get Keyclok Admin Access Token using method from imported functions script
KEYCLOAK_ADMIN_ACCESS_TOKEN=$(getKeycloakAdminAccessToken)

#Copy default Browser authentication flow with alias CHPQA_Browser
CUSTOM_BROWSER_AUTHENTICATION_FLOW=$(curl -s -L -X POST "$UPDATE_REALM_URL$CHPQA_REALM_NAME"/authentication/flows/browser/copy \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $KEYCLOAK_ADMIN_ACCESS_TOKEN" \
--data-raw '{
    "newName": "'"$CHPQA_BROWSER"'"
}')

if [ -z "$CUSTOM_BROWSER_AUTHENTICATION_FLOW" ]
then
	echo " Realm $CHPQA_REALM_NAME updated successfully"
else
	#In case of error during realm creation, print the error and exit in order to avoid successfully loging the script execution
	echo " $CUSTOM_BROWSER_AUTHENTICATION_FLOW"
	exit;
fi

#Add script name as user to changelog realm for tracking purposes
ADD_SCRIPT_TO_CHANGELOG=$(addUserToChangeLogRealm "$SCRIPT_NAME")

if [ -z "$ADD_SCRIPT_TO_CHANGELOG" ]
then
	echo " Script $SCRIPT_NAME added to changelog"
else
	echo " Script $SCRIPT_NAME was not to added to changelog. Reason: $ADD_SCRIPT_TO_CHANGELOG"
fi
