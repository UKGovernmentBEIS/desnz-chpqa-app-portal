#!/bin/bash

#This script updates the CHPQA realm in order to configure the password policy based on length(minimun 12 characters, max 128 and 100000 hashIterations).

SCRIPT_NAME=$(basename -- "$0")

set -e

#Variables Declaration
UPDATE_REALM_URL="$BASE_URL/admin/realms/"

#Get Keycloak Admin Access Token using method from imported functions script
KEYCLOAK_ADMIN_ACCESS_TOKEN=$(getKeycloakAdminAccessToken)

#Configures the CHPQA realm with the desired password policy
CONFIG_CHPQA_REALM_PASSWORD_POLICY=$(curl -s -L -X PUT "$UPDATE_REALM_URL$CHPQA_REALM_NAME" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $KEYCLOAK_ADMIN_ACCESS_TOKEN" \
--data-raw '{
    "passwordPolicy": "length(12) and maxLength(127) and hashIterations(100000)"
}')

if [ -z "$CONFIG_CHPQA_REALM_PASSWORD_POLICY" ]
then
	echo " Realm $CHPQA_REALM_NAME updated successfully"
else
	#In case of error during realm creation, print the error and exit in order to avoid successfully logging the script execution
	echo " $CONFIG_CHPQA_REALM_PASSWORD_POLICY"
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
