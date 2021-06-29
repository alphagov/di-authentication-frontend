#!/usr/bin/env bash
set -eu

CLEAN=0
LOCAL=0
while getopts "cl" opt; do
  case ${opt} in
    c)
        CLEAN=1
      ;;
    l)
        LOCAL=1
      ;;
    *)
        usage
        exit 1
      ;;
  esac
done

if [ $CLEAN == "1" ]; then
  echo "Cleaning dist and node_modules..."
  rm -rf dist
  rm -rf node_modules
fi

if [ $LOCAL == "1" ]; then
  echo "Starting di-auth-frontend-dev on local..."
  yarn install && yarn run copy-build && yarn run dev
else
  running_count=$(docker ps -a | grep "di-auth-frontend-dev" | wc -l | awk '{ print $1 }')
  if [ ${running_count} -ne 0 ]; then
    echo "Restarting di-auth-frontend-dev..."
    docker stop di-auth-frontend-dev
    docker rm di-auth-frontend-dev --force
  fi
  echo "Starting di-auth-frontend-dev in docker..."
  docker run --name di-auth-frontend-dev -dp 3000:3000 -w /app -v "$(pwd):/app"  node:15-alpine sh -c "yarn install && yarn copy-build && yarn dev"
fi