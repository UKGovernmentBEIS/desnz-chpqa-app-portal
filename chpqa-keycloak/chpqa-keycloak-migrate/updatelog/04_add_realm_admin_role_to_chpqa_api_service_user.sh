#!/bin/bash

#This script adds realm-admin role in realm-management client for chpqa-app-api system user

SCRIPT_NAME=$(basename -- "$0")

set -e
KEYCLOAK_ADMIN_ACCESS_TOKEN=$(getKeycloakAdminAccessToken)

GET_CHPQA_API_SERVICE_USER_URL="$BASE_URL/admin/realms/$CHPQA_REALM_NAME/clients/7d5f7851-78d2-43f4-ab96-fa3bf6af07e6/service-account-user"
SERVICE_USER=$(curl -s -L -G "$GET_CHPQA_API_SERVICE_USER_URL" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $KEYCLOAK_ADMIN_ACCESS_TOKEN")
SERVICE_USER_ID=$(echo "$SERVICE_USER" | jq -r '.id')

GET_REALM_MANAGEMENT_CLIENT_URL="$BASE_URL/admin/realms/$CHPQA_REALM_NAME/clients"
REALM_MANAGEMENT_CLIENT=$(curl -s -L -G "$GET_REALM_MANAGEMENT_CLIENT_URL" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $KEYCLOAK_ADMIN_ACCESS_TOKEN" \
  --data-urlencode "clientId=realm-management")
REALM_MANAGEMENT_CLIENT_ID=$(echo "$REALM_MANAGEMENT_CLIENT" | jq -r ".[0] | .id")

GET_REALM_ADMIN_ROLE_URL="$BASE_URL/admin/realms/$CHPQA_REALM_NAME/clients/$REALM_MANAGEMENT_CLIENT_ID/roles/realm-admin"
REALM_ADMIN_ROLE=$(curl -s -L -G "$GET_REALM_ADMIN_ROLE_URL" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $KEYCLOAK_ADMIN_ACCESS_TOKEN")
REALM_ADMIN_ROLE_ID=$(echo "$REALM_ADMIN_ROLE" | jq -r '.id')

UPDATE_CHPQA_API_SERVICE_USER_URL="$BASE_URL/admin/realms/$CHPQA_REALM_NAME/users/$SERVICE_USER_ID/role-mappings/clients/$REALM_MANAGEMENT_CLIENT_ID"
CHPQA_API_SERVICE_USER=$(curl -s -L -X POST "$UPDATE_CHPQA_API_SERVICE_USER_URL" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $KEYCLOAK_ADMIN_ACCESS_TOKEN" \
--data-raw '[
  {
    "clientRole": true,
    "composite": true,
    "name": "realm-admin",
    "id": "'$REALM_ADMIN_ROLE_ID'"
  }
]')

if [ -z "$CHPQA_API_SERVICE_USER" ]
then
	echo " $SCRIPT_NAME executed successfully"
else
	echo " $SCRIPT_NAME failed $CHPQA_API_SERVICE_USER"
fi
