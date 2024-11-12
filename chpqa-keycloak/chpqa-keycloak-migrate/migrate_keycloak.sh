#!/bin/bash

#Script that must run in order to configure keycloak
#All scripts that have to be executed must be added in the changelog folder and declare here
#Each script should call addUserToChangeLogRealm function from '/common/functions' as last action, in order to keep changelogs and avoid conflicts and issues.

SCRIPT_NAME=$(basename -- "$0")

set -e

#Import other scripts
CURRENT_PATH="$(dirname "$0")"
source "$CURRENT_PATH/common/functions.sh"
source "$CURRENT_PATH/migrate_keycloak_vars.sh"

logMessage ">>>>>>>>>> Start keycloak configuration >>>>>>>>>>"

#Variables Declaration
CHANGELOG_PATH="changelog/"

#Scripts based on environment variables
UPDATELOG_PATH="updatelog/"

#Add here all scripts that need to be executed for configuring keycloak
#Scripts must be added with proper execution order
changelogScripts=(
"01_introduce_changelog_realm.sh"
"02_create_chpqa_realm.sh"
"03_configure_chpqa_realm_password_policy.sh"
"04_configure_chpqa_realm_otp_policy.sh"
"05_prepare_chpqa_browser_authentication_flow.sh"
"06_configure_chpqa_browser_conditional_otp.sh"
"07_bind_chpqa_browser_flow_to_realm_broswer.sh"
"08_configure_session_and_token_timeouts.sh"
"09_configure_brute_force.sh"
)

updatelogScripts=(
#all scripts that update the realm must be executed prior to scripts that add roles
"01_update_client_chpqa_web.sh"
"02_update_client_chpqa_api.sh"
"03_update_smtp_host.sh"
#the next script must ALWAYS run after any script that updates the realm because every time the realm is updated, new service-account-user is created
"04_add_realm_admin_role_to_chpqa_api_service_user.sh"
"05_update_chpqa_realm.sh"
)

#Get already executed scripts as concatenated string
EXECUTED_SCRIPTS=$(getChangeLogRealmUsers)

#Loop through changelogScripts array and execute scripts that are not already executed
for script in "${changelogScripts[@]}"
do
	if [[ "$EXECUTED_SCRIPTS" == *"$script"* ]]; then
		logMessage "$script has already been applied"
	else
		logMessage "Running $script"
		var="${CHANGELOG_PATH}${script}"
		eval $CURRENT_PATH/$var
	fi
done

#Loop through updatelogScripts array and execute scripts
for script in "${updatelogScripts[@]}"
do
	logMessage "Running $script"
	var="${UPDATELOG_PATH}${script}"
	eval $CURRENT_PATH/$var
done

logMessage ">>>>>>>>>> Keycloak configuration finished >>>>>>>>>>"
