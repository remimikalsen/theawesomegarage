#!/bin/bash
# Author: Remi Mikalsen
# The original script can be found in https://github.com/remimikalsen/theawesomegarage
#
# This script will shut down all your containers, pull new images and then perform a forceful 
# rebuild and restart of all your docker containers according to the configuration given in your 
# docker-compose.yml file. In the end, old images are pruned in order to save space
#
# For my setup, a typical run gives me appriximately 45 seconds downtime. Your mileage may vary.
# A cleaner solution to maintaining up to date containers is https://github.com/pyouroboros/ouroboros
# See also:
#  - https://theawesomegarage.com/blog/updating-your-docker-containers-automatically
#  - https://theawesomegarage.com/blog/updating-your-docker-containers-automatically-v2
#
# Put the script in the crontab belonging to the user you normally use to run docker commands.
# crontab -e


#
# Configuration
#

# To identify the server in emails
HOST=

# Who should receive logs by email
RECIPIENT=

# Where does the docker-compose.yml file reside
DOCKER_COMPOSE_HOME=

#
# Start
#

SECONDS=0
FAILURE=0
MESSAGE="docker container update status follows"

# Changing to docker setup directory
if [[ -d ${DOCKER_COMPOSE_HOME} ]]; 
then
  cd ${DOCKER_COMPOSE_HOME}
else
  FAILURE=1
  MESSAGE="${MESSAGE}\n\nDocker compose directory does not exist:\n${DOCKER_COMPOSE_HOME}"
fi

if [ $FAILURE != "1" ]
then
  RESULT=`/usr/local/bin/docker-compose down 2>&1`
  FAILED=$?
  if [ $FAILED != "0" ]
  then
    FAILURE=1
    MESSAGE="${MESSAGE}\n\nFailed shutting down containers:\n${RESULT}"
  else
    ELAPSED="$(($SECONDS / 3600))h $((($SECONDS / 60) % 60))m $(($SECONDS % 60))s"
    MESSAGE="${MESSAGE}\n\nSuccessfully shut down containers after: ${ELAPSED}."
  fi
fi


if [ $FAILURE != "1" ]
then
  RESULT=`/usr/local/bin/docker-compose pull 2>&1`
  FAILED=$?
  if [ $FAILED != "0" ]
  then
    FAILURE=1
    MESSAGE="${MESSAGE}\n\nFailed pulling new images:\n${RESULT}"
  else
    ELAPSED="$(($SECONDS / 3600))h $((($SECONDS / 60) % 60))m $(($SECONDS % 60))s"
    MESSAGE="${MESSAGE}\n\nSuccessfully pulled new images after ${ELAPSED}."
  fi
fi


if [ $FAILURE != "1" ]
then
  RESULT=`/usr/local/bin/docker-compose up -d --force-recreate --build 2>&1`
  FAILED=$?
  if [ $FAILED != "0" ]
  then
    FAILURE=1
    MESSAGE="${MESSAGE}\n\nFailed rebuilding containers:\n${RESULT}"
  else
    ELAPSED="$(($SECONDS / 3600))h $((($SECONDS / 60) % 60))m $(($SECONDS % 60))s"
    MESSAGE="${MESSAGE}\n\nSuccessfully rebuilt containers after ${ELAPSED}."
  fi
fi

if [ $FAILURE != "1" ]
then
  RESULT=`/usr/bin/docker image prune -f 2>&1`
  FAILED=$?
  if [ $FAILED != "0" ]
  then
    FAILURE=1
    MESSAGE="${MESSAGE}\n\nFailed pruning images:\n${RESULT}"
  else
    MESSAGE="${MESSAGE}\n\nSuccessfully pruned images."
  fi
fi

ELAPSED="$(($SECONDS / 3600))h $((($SECONDS / 60) % 60))m $(($SECONDS % 60))s"
MESSAGE="${MESSAGE}\n\nTotal runtime: ${ELAPSED}"

if [ $FAILURE == "1" ]
then
  echo -e "${MESSAGE}" | mail -s "${HOST} - FAILURE rebuilding docker images" ${RECIPIENT}
else
  echo -e "${MESSAGE}" | mail -s "${HOST} - successfully rebuilt docker containers" ${RECIPIENT}
fi

#
# End script
#
