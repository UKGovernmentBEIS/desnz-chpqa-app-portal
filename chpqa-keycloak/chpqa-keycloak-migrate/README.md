# Overview
This is the code repository that contains the latest version of the CHPQA portal web applications.

Chpqa Application Structure
The mission of CHPQA (Combined Heat and Power Quality Assurance Programme) is to ensure excellence and reliability within Combined Heat and Power (CHP) systems in the UK.

Desnz Chpqa portal applications consists on the following:

| Application Name        | Description           | Folder Name  |
| :------------- |:-------------| :-----:|
| CHPQA Portal     | The GDS compliant customer facing application that is publicly available. It is deployed as a linux nodejs webapp application in Azure | "chpqa-app" |
| CHPQA Proxy      | A proxy service acting as a middleware between CHPQA Proxy and backend systems. It is deployed as a linux dotnet 8 application in Azure      |   "Dynamic CRM Integration Web API"|
| Authentication Service | A service for authenticating the public facing users of the system. It is deployed as a docker container application in Azure    |   "chpqa-keycloak" |

# Requirements

To run the code locally using the provided scripts, the following are required:
- You need to install docker (https://docs.docker.com/engine/install/) on your machine. 
- You need to install docker compose (https://docs.docker.com/compose/install/) on your machine.
- For security reasons, any application specific configuration values are not shared here. Therefore, you need to do the configuration for each application on your own.

# Instuctions
In order to run all the web applications of this repository in your local docker enviroment, do the following:

1. Clone this repository to your local machine
2. Ensure that all the configuration variables (including keys, secrets and ports) are properly set and filled. Specifically, the values in appsettings.json, environment.ts & docker-compose should be filled.
3. Run the _buildme.sh script that is located in the root folder of the cloned repository. This script builds a docker image for each application, using the custom DockerFiles included in each folder.
4. Run the _runme.sh that is located in the root folder of the cloned repository. This script runs all the built docker images (from the previous step) as services via docker compose.
5. Visit the corresponding localhost addresses to check if each application is up and running.

If you wish to run each application seperately:
- CHPQA Portal: Follow the instuctions of the README file on how to run an angular app via angular-cli, found inside the folder "chpqa-app".
- CHPQA Proxy: Either run the application code following the official instuctions (https://learn.microsoft.com/en-us/aspnet/core/tutorials/publish-to-azure-api-management-using-vs?view=aspnetcore-8.0)
  or run the dockerize-start.sh, dockerize-finish.sh scripts found inside the folder "Dynamic CRM Integration Web API" for a seperate dockerized application.
- Authentication Service: Run _buildme.sh, _runme.sh found inside the folder "chpqa-keycloak". This will create a seperate dockerized keycloak service.

# Requirements (Without Containers)

CHPQA Portal & CHPQA Proxy applications can run locally as traditional web applications without the use of docker and containerized environment. 
If opt to do so, you need to install every requirement for each application. In general, you have to follow the official installation instuctions for Angular and dotnet web applications 
- https://angular.dev/installation
- https://learn.microsoft.com/en-us/dotnet/core/install/windows


# Usefull Links
- https://angular.dev/tools/cli/environments
- https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-8.0 
- https://www.keycloak.org/server/configuration
