# Overview
This is the code repository of CHPQA (Combined Heat and Power Quality Assurance Programme) that contains the latest version of the CHPQA portal web applications.
The mission of CHPQA is to ensure excellence and reliability within Combined Heat and Power (CHP) systems in the UK.
The working application source code is managed and maintained by the private beta delivery supplier Unisystems in seperate repository. This repo is refreshed whenever there is a release deployed to the production environment. 


DESNZ CHPQA portal applications consists of the following:

| Application Name        | Description           | Folder Name  |
| :------------- |:-------------| :-----:|
| CHPQA Portal     | The GDS compliant customer facing application that is publicly available. It is created using angular framework and it is deployed as a linux nodejs webapp application in Azure infrastructure | "chpqa-app" |
| CHPQA Proxy      | A proxy service acting as a middleware between CHPQA Proxy and backend systems. It is created using the MS dotnet framework and it is deployed as a linux dotnet 8 application in Azure infrastructure   |   "Dynamic CRM Integration Web API"|
| Authentication Service | A service for authenticating the public facing users of the system. It is created using the opensource Keycloak identity and access management solution and it is deployed as a docker container application in Azure infrastructure   |   "chpqa-keycloak" |


# Requirements

To run the code locally using the provided scripts, the following are required:
- You need to install docker (https://docs.docker.com/engine/install/) on your machine. 
- You need to install docker compose (https://docs.docker.com/compose/install/) on your machine.
- For security reasons, any application specific configuration values are not shared here. Therefore, you need to do the configuration for each application on your own.

# Instructions
In order to run all the web applications of this repository in your local docker enviroment, do the following:

1. Clone this repository to your local machine
2. Ensure that all the configuration variables (including keys, secrets and ports) are properly set up.
3. Run the _buildme.sh script that is located in the root folder of the cloned repository. This script builds a docker image for each application, using the custom DockerFiles included in each folder.
4. Run the _runme.sh that is located in the root folder of the cloned repository. This script runs all the built docker images (from the previous step) as services via docker compose.
5. Visit the corresponding localhost addresses to check if each application is up and running.

If you wish to run each application seperately:
- CHPQA Portal: Follow the instuctions of the README file on how to run an angular app via angular-cli, found inside the folder "chpqa-app".
- CHPQA Proxy: Run the dockerize-start.sh, dockerize-finish.sh scripts found inside the folder "Dynamic CRM Integration Web API" for a seperate dockerized application.
- Authentication Service: Run _buildme.sh, _runme.sh found inside the folder "chpqa-keycloak". This will create a seperate dockerized keycloak service.

# Requirements (Without the use of docker & containers)

CHPQA Portal & CHPQA Proxy applications can run locally as traditional web applications without the use of docker and containerized environments. 
If opt to use them as such, you need to install every requirement for each application in your machine. In general, you have to follow the official installation instuctions for Angular and dotnet applications as found in the following links
- https://angular.dev/installation
- https://learn.microsoft.com/en-us/dotnet/core/install/windows


# Usefull Links
- https://angular.dev/tools/cli/environments
- https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-8.0 
- https://www.keycloak.org/server/configuration
