#!/bin/bash
# Author: Remi Mikalsen
# The original script can be found in https://github.com/remimikalsen/theawesomegarage
#
# Build, tag and push images to local registry
# sudo crontab -e


#
# Configuration
#

# To identify the server in emails
HOST=home-server

# Who should receive logs by email
RECIPIENT=remimikalsen@gmail.com

# Base dir under which there are directories containing Dockerfiles 
BASE_DIR=/home/remi/docker-setup

# Run following command to get an *idea* of what images ar used:
# grep FROM ${BASE_DIR}/docker-setup/*/Dockerfile
PULL_IMAGES=(
 "php:7.2-apache"
)

# Directories under BASE_DIR that containt Dockerfiles to generate images from
BUILD_IMAGES=(
 "grav"
 "simple-apache-php"
)


#
# Start
#
SECONDS=0
FAILURE=0
MESSAGE="custom docker image update status follows"

# First pull base images used in the various Dockerfiles
for IMAGE in "${PULL_IMAGES[@]}"
  do
    RESULT=`/usr/bin/docker pull ${IMAGE} 2>&1`
    FAILED=$?
    if [ $FAILED != "0" ]
    then
      FAILURE=1
      MESSAGE="${MESSAGE}\n\nFailed fetching updated images:\n${RESULT}"
    else
      ELAPSED="$(($SECONDS / 3600))h $((($SECONDS / 60) % 60))m $(($SECONDS % 60))s"
      MESSAGE="${MESSAGE}\n\nSuccessfully checked and/or downloaded new images: ${ELAPSED}:\n${RESULT}"
    fi
  done

# Then build all custom images
for IMAGE in "${BUILD_IMAGES[@]}"
  do
    MESSAGE="${MESSAGE}\n\n\n\nReport for image: ${IMAGE}"

    RESULT=`/usr/bin/docker build -t grav ${BASE_DIR}/${IMAGE}/. 2>&1`
    FAILED=$?
    if [ $FAILED != "0" ]
    then
      FAULURE=1
      MESSAGE="${MESSAGE}\n\nFailed building image after: ${ELAPSED}:\n${RESULT}"
    else
      MESSAGE="${MESSAGE}\n\nCompleted docker build after: ${ELAPSED}:\n${RESULT}"
    fi

    RESULT=`/usr/bin/docker tag grav localhost:5000/${IMAGE}:latest 2>&1`
    if [ $FAILED != "0" ]
    then
      FAULURE=1
      MESSAGE="${MESSAGE}\n\nFailed taggingimage after: ${ELAPSED}:\n${RESULT}"
    else
      MESSAGE="${MESSAGE}\n\nCompleted docker tag after: ${ELAPSED}:\n${RESULT}"
    fi

    RESULT=`/usr/bin/docker push localhost:5000/${IMAGE}:latest 2>&1`
    if [ $FAILED != "0" ]
    then
      FAULURE=1
      MESSAGE="${MESSAGE}\n\nFailed pushing image after: ${ELAPSED}:\n${RESULT}"
    else
      MESSAGE="${MESSAGE}\n\nCompleted docker push after: ${ELAPSED}:\n${RESULT}"
    fi
  done


if [ $FAILURE != "0" ]
then
  echo -e "${MESSAGE}" | mail -s "${HOST} - FAILURE in custom docker image update" ${RECIPIENT}
else
  echo -e "${MESSAGE}" | mail -s "${HOST} - custom docker image update ran without errors" ${RECIPIENT}
fi
#
# End
#
