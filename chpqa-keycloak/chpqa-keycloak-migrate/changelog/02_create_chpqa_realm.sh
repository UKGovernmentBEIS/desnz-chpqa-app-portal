#!/bin/bash

#This script creates a new realm named CHPQA and adds basic configuration including:
#	a) A realm role named chpqa_user defined as default realm role
#	b) A user defined as realm admin
#	c) Two clients, chpqa-app-api (confidential) and chpqa-app-web (public)

SCRIPT_NAME=$(basename -- "$0")

set -e

#Variables Declaration
CREATE_REALM_URL="$BASE_URL/admin/realms"

#Get Keyclok Admin Access Token using method from imported functions script
KEYCLOAK_ADMIN_ACCESS_TOKEN=$(getKeycloakAdminAccessToken)

#Create new realm
CREATE_REALM=$(curl -s -L -X POST "$CREATE_REALM_URL" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $KEYCLOAK_ADMIN_ACCESS_TOKEN" \
--data-raw '{
	"id": "'$CHPQA_REALM_NAME'",
	"realm": "'$CHPQA_REALM_NAME'",
	"enabled": true,
	"registrationAllowed" : true,
	"registrationEmailAsUsername" : true,
	"roles": {
		"realm": [
		  {
			"name": "chpqa_user",
			"description": "CHPQA User"
		  }
		]
	},
	"defaultRoles" : [ "offline_access", "chpqa_user", "uma_authorization" ],
	"loginTheme": "chpqa-theme",
	"clients": [
		{
			"id": "0e3b0a7e-224e-4cde-b239-ae6849d3b8bd",
			"clientId": "chpqa-app-web",
			"enabled": true,
			"publicClient" : true,
			"redirectUris": ["'$CHPQA_WEB_APP_LOCALHOST_URL'/*", "'$CHPQA_WEB_APP_URL'/*"],
			"protocol": "openid-connect",
			"attributes": {},
			"baseUrl": "'$CHPQA_WEB_APP_URL'",
			"adminUrl": "'$CHPQA_WEB_APP_URL'",
			"webOrigins": ["'$CHPQA_WEB_APP_LOCALHOST_URL'", "'$CHPQA_WEB_APP_URL'"],
			"directAccessGrantsEnabled": true,
			"attributes": {
				"pkce.code.challenge.method": "S256"
			}
		},
		{
			"id": "7d5f7851-78d2-43f4-ab96-fa3bf6af07e6",
			"clientId": "chpqa-app-api",
			"enabled": true,
			"protocol": "openid-connect",
			"attributes": {},
			"secret" : "'$CHPQA_API_CLIENT_SECRET'",
			"redirectUris" : [ "'$CHPQA_API_APP_URL'" ],
			"webOrigins": ["'$CHPQA_API_APP_URL'", "'$CHPQA_WEB_APP_URL'"],
			"serviceAccountsEnabled" : true,
			"authorizationServicesEnabled" : true,
			"publicClient" : false
		}
	]
}')

if [ -z "$CREATE_REALM" ]
then
	echo " Realm $CHPQA_REALM_NAME created successfully"
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
