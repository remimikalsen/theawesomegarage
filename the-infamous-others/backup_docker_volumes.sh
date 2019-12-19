#!/bin/bash
# Author: Remi Mikalsen
# The original script can be found in https://github.com/remimikalsen/theawesomegarage
#
# Script to back up container volumes
#
# Notes on recovering
#   Stop your container
#   Recover your volumes
#     docker volume create my_volume (unless already created by docker-compose)
#     docker run --rm -v my_volume:/restore -v /local/backup/dir:/backup ubuntu bash -c "cd /restore && yes | rm -rf . && tar -xzf /backup/my_volume.tar”
#   Start your image 


#
# Configuration
#

# To identify the server in emails
HOST=home-server

# Who should receive logs by email
RECIPIENT=remimikalsen@gmail.com

# Base dir to which make back-ups 
BACKUP_DIR=/home/remi/docker-volume-backups

# Container > Volumes to back up
declare -A CONTAINER_VOLUMES

CONTAINER_VOLUMES=(
  ["passbolt passbolt_db"]="home-server_docker_passbolt_db home-server_docker_passbolt_gpg home-server_docker_passbolt_images"
  ["nextcloud-db nextcloud-redis nextcloud-app nextcloud-web"]="home-server_docker_nextcloud-db home-server_docker_nextcloud-db-logs home-server_docker_nextcloud-redis home-server_docker_nextcloud-html"
)


# Start
#
SECONDS=0
FAILURE=0
MESSAGE="docker volume backup status follows"


for containers in "${!CONTAINER_VOLUMES[@]}"; 
do 

  docker stop ${containers} &> /dev/null

  volumes=( ${CONTAINER_VOLUMES[${containers}]} )
  for volume in "${volumes[@]}";
  do
    docker run --rm -v ${volume}:/volume -v ${BACKUP_DIR}:/backup ubuntu bash -c "cd /volume && tar -zcf /backup/${volume}.tar ." &> /dev/null
    FAILED=$?
    if [ $FAILED != "0" ]
    then
      FAILURE=1
      MESSAGE="${MESSAGE}\n\nFailed backing up:\n${volume}"
    else
      ELAPSED="$(($SECONDS / 3600))h $((($SECONDS / 60) % 60))m $(($SECONDS % 60))s"
      MESSAGE="${MESSAGE}\n\nSuccessfully backed up volume ${volume}. Elapsed ${ELAPSED}"
    fi

  done

  docker start ${containers} &> /dev/null

done

if [ $FAILURE != "0" ]
then
  echo -e "${MESSAGE}" | mail -s "${HOST} - FAILURE in docker volume backup" ${RECIPIENT}
else
  echo -e "${MESSAGE}" | mail -s "${HOST} - docker volume backup ran without errors" ${RECIPIENT}
fi
#
# End
#
