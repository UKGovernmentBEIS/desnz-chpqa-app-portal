#!/bin/bash

export COMPOSE_CONVERT_WINDOWS_PATHS=1

docker-compose up -d

#explorer.exe "http://localhost:4200/"
#explorer.exe "http://localhost:8091/auth/"
#explorer.exe "http://localhost:5200/swagger/index.html"
#docker-compose logs --follow