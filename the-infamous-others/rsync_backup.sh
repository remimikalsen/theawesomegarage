#!/bin/bash
# This scripts allows you to back up several local directories to a remote server with rsync over ssh, and get the status sent by e-mail.
# Perfect to run regular rsync backup jobs in cron and get notified of success, failure, number of files and quantity of data transferred.
#
# Author: Remi Mikalsen
# The original script can be found in https://github.com/remimikalsen/theawesomegarage
# 
# In order to assure no files are excluded for the lack of privileges, the author suggests that this script is called from the root crontab.
# sudo crontab -e

# To identify the server in emails
HOST=

# Who should receive logs by email
RECIPIENT=

# What local directories to sync
SYNC_DIRS=(
 "/home"
)
# Where to log results on disk
LOG_FILE=/var/log/rsync.log

# Remote server
REMOTE_SERVER=

# Remote SSH port
REMOTE_PORT=

# Remote server user
REMOTE_USER=

# Remote directory
REMOTE_DIR=

# Private key for authentication - remember to have your public key in remote server user's authorized_keys file
IDENTITY_FILE=

# Bandwith limit to avoid congesting your router
BWLIMIT=5000

FAILURE=0
MESSAGE="rsync status follows"

# Do stuff
for DIR in "${SYNC_DIRS[@]}"
  do
    SECONDS=0
    STATS=`/usr/bin/rsync --log-file=${LOG_FILE} --bwlimit=${BWLIMIT} -az --stats -h -e "/usr/bin/ssh -i ${IDENTITY_FILE} -p ${REMOTE_PORT}" --backup --backup-dir="rsync_bak_\`date '+\%F_\%H-\%M'\`" ${DIR} "${REMOTE_USER}@${REMOTE_SERVER}:${REMOTE_DIR}" | awk '/Number of regular files transferred|Total transferred file size/'`
    
    ELAPSED="$(($SECONDS / 3600))h $((($SECONDS / 60) % 60))m $(($SECONDS % 60))s"
    if [ $? != "0" ] 
    then
      FAILURE=1
      MESSAGE="${MESSAGE}\n\n${DIR} - failed rsyncing after ${ELAPSED}.\n${STATS}"
    else
      MESSAGE="${MESSAGE}\n\n${DIR} - succeeded rsyncing in ${ELAPSED}.\n${STATS}"
    fi
  done

if [ $FAILURE != "0" ]
  then
    echo -e "${MESSAGE}" | mail -s "${HOST} - FAILURES in rsync backup" ${RECIPIENT}
  else
    echo -e "${MESSAGE}" | mail -s "${HOST} - rsync backup succeeded" ${RECIPIENT}
fi
