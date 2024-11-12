#!/usr/bin/env sh

imagename=${1:-webapi}
containername="${2:-webapicontainer}"
port=${3:-5000}
extport=${4:-8080}

docker build -t $imagename .
docker run --name $containername -d -p $port:$extport $imagename

explorer.exe "http://localhost:${port}/swagger/index.html"


