#!/bin/bash

#This script updates the CHPQA realm in order to configure Session and Token Timeouts.

SCRIPT_NAME=$(basename -- "$0")

set -e

#Variables Declaration
UPDATE_REALM_URL="$BASE_URL/admin/realms/"

#Get Keyclok Admin Access Token using method from imported functions script
KEYCLOAK_ADMIN_ACCESS_TOKEN=$(getKeycloakAdminAccessToken)

#Configures the CHPQA realm with the desired session and token timeouts
CONFIG_CHPQA_SESSION_AND_TOKEN_TIMEOUTS=$(curl -s -L -X PUT "$UPDATE_REALM_URL$CHPQA_REALM_NAME" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $KEYCLOAK_ADMIN_ACCESS_TOKEN" \
--data-raw '{
    "defaultSignatureAlgorithm": "RS256",
    "revokeRefreshToken": false,
    "ssoSessionIdleTimeout": 1800,
    "ssoSessionMaxLifespan": 28800,
    "accessTokenLifespan": 60,
    "accessCodeLifespan": 60,
    "accessCodeLifespanLogin": 240,
    "accessCodeLifespanUserAction": 300,
    "actionTokenGeneratedByUserLifespan": 300,
    "actionTokenGeneratedByAdminLifespan": 28800
}')

if [ -z "$CONFIG_CHPQA_SESSION_AND_TOKEN_TIMEOUTS" ]
then
	echo "Realm $CHPQA_REALM_NAME updated successfully"
else
	#In case of error during realm creation, print the error and exit in order to avoid successfully logging the script execution
	echo "$CONFIG_CHPQA_SESSION_AND_TOKEN_TIMEOUTS"
	exit;
fi

#Add script name as user to changelog realm for tracking purposes
ADD_SCRIPT_TO_CHANGELOG=$(addUserToChangeLogRealm "$SCRIPT_NAME")

if [ -z "$ADD_SCRIPT_TO_CHANGELOG" ]
then
	echo " Script $SCRIPT_NAME added to changelog"
else
	echo "Script $SCRIPT_NAME was not to added to changelog. Reason: $ADD_SCRIPT_TO_CHANGELOG"
fi