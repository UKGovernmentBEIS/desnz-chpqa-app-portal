#!/bin/bash

SCRIPT_NAME=$(basename -- "$0")

set -e

#Variables Declaration
UPDATE_REALM_URL="$BASE_URL/admin/realms/"

#Get Keyclok Admin Access Token using method from imported functions script
KEYCLOAK_ADMIN_ACCESS_TOKEN=$(getKeycloakAdminAccessToken)

#Create new realm
UPDATE_CHPQA_REALM=$(curl -s -L -X PUT "$UPDATE_REALM_URL$CHPQA_REALM_NAME" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $KEYCLOAK_ADMIN_ACCESS_TOKEN" \
--data-raw '{
	"id": "'$CHPQA_REALM_NAME'",
	"realm": "'$CHPQA_REALM_NAME'",
	"displayName": "'$CHPQA_REALM_DISPLAY_NAME'"
}')

if [ -z "UPDATE_CHPQA_REALM" ]
then
	echo " Realm $CHPQA_REALM_NAME updated successfully"
else
	#In case of error during realm creation, print the error and exit in order to avoid successfully loging the script execution
	echo " $CREATE_REALM"
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
