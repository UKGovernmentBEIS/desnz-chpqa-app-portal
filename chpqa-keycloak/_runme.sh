#!/bin/bash

export COMPOSE_CONVERT_WINDOWS_PATHS=1

docker-compose up -d
#docker-compose logs --follow