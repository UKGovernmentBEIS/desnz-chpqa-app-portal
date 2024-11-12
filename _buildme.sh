#!/bin/bash
#----------------------Build all docker images ------------------------------------------
pushd chpqa-app/
docker image build -t chpqa-app:latest -f Dockerfile .
popd

pushd chpqa-keycloak/
mvn clean install
# shellcheck disable=SC2181
if [[ "$?" -ne 0 ]]; then
  echo 'Maven build failed'
  exit 2
fi
docker image build -t keycloak-chpqa:latest -f Dockerfile_aws .
popd

pushd Dynamic\ CRM\ Integration\ Web\ API/
docker image build -t crm-webapi:latest -f Dockerfile .
popd
#----------------------------------------------------------------------------------------