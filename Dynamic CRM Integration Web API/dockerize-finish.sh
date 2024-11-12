#!/usr/bin/env sh

imagename=${1:-webapi}
containername="${2:-webapicontainer}"

docker stop $containername && docker rm $containername
docker rmi $(docker images -q "${imagename}" | uniq)
