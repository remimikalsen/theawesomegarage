#!/bin/sh

# Generate host SSH keys
#if [ ! -e /etc/ssh/ssh_host_rsa_key.pub ]; then
#  ssh-keygen -A
#fi

# Create root .ssh dir if it doesn't exist
if [ ! -d /root/.ssh ];
  mkdir /root/.ssh
  chmod 700 /root/.ssh
  touch /root/.ssh/id_rsa
  touch /root/.ssh/id_rsa.pub
  chmod 600 /root/.ssh/*
fi

# Update rsync user SSH keys on every startup
cat ${SYNOLOGY_RSYNC_PRIVKEY} > /root/.ssh/id_rsa
cat ${SYNOLOGY_RSYNC_PUBKEY} > /root/.ssh/id_rsa.pub

# Provide CRON_TASK_* via environment variables
> /etc/crontabs/root
for item in `env`; do
   case "$item" in
       CRON_TASK*)
            ENVVAR=`echo $item | cut -d \= -f 1`
            printenv $ENVVAR >> /etc/crontabs/root
            echo "root" > /etc/crontabs/cron.update
            ;;
   esac
done

exec /usr/sbin/crond -f
