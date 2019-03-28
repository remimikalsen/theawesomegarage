# Installation of a dockerized home network application stack

## Installation of base packages

### Install Docker
Execute the following in order:
- curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
- sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
- sudo apt-get update
- sudo apt-get install -y docker-ce
- sudo systemctl status docker

Allow your regular user to do docker stuff without sudoing
- sudo usermod -aG docker ${USER}
- su - ${USER}
- id -nG

### Install Docker Compose
Execute the following commands in order to use docker compose to manage containers:
- sudo curl -L "https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
- sudo chmod +x /usr/local/bin/docker-compose
- sudo curl -L https://raw.githubusercontent.com/docker/compose/1.23.2/contrib/completion/bash/docker-compose -o /etc/bash_completion.d/docker-compose

PS! Use latest stable release: https://github.com/docker/compose/releases

## Necessary configurations
The follwoing modifications need to be done on the host OS for Redis to work properly.
- append vm.overcommit_memory=1 to /etc/sysctl.conf
- run following command as root on host: echo never > /sys/kernel/mm/transparent_hugepage/enabled
- Note that Docker uses the PREROUTE chain in iptables, which shortcuts limitations put in the INPUT chain. Thus, do not publish ports in docker-compose.yml that aren't supposed to be public. If you're behind a NAT firewall, you're probably good, but if you're connected directly to the internet, beware!

## Bind mounts
The containers in this stack will need a place to store persistent data. It is recommended to put this data in a directory outside of the Git-checkout dir - simply to avoid adding and pushing sensitive data to remote repo by accident.

Copy the folder my-config-templates to a suitable location on your host computer. E.g.
- cp -R <git-checkout-dir>/my-docker-data-template ~/my-docker-data

Specify the full path to your config directory in the MY_DOCKER_DATA_DIR variable on the second line in the docker-compose .env-file

## Applications included in this stack
- Owncloud (external, https)
-- Owncloud http
-- Owncloud db
-- Owncloud redis
- Basic Apache server with PHP support (external, https)
- Portainer (external, https)
- Cadvisor (home network only)
- Nginx
-- Automatic vhost generator
-- Automatic Letsencrypt certs
- OpenVPN
-- An OpenVPN server (note, may not work correctly - see readme.md in openvpn directory)
- Backup
-- An rsync client readily configured to work over SSH against Synology NAS
- Montitoring and logging
-- Sematext monitoring agent
-- Sematext log agent

## Installation
Before running docker-compose up, initialize containers that need initializing!
- OpenVPN-server
-- docker-compose run --rm openvpn-server ovpn_genconfig -u udp://VPN.SERVERNAME.COM
-- docker-compose run --rm openvpn-server ovpn_initpki
-- sudo chown -R $(whoami): ../my-docker-data/openvpn-server
-- Create OpenVPN-server client certs
--- export CLIENTNAME="your_client_name"
--- # with a passphrase (recommended)
--- docker-compose run --rm openvpn easyrsa build-client-full $CLIENTNAME
--- # without a passphrase (not recommended)
--- docker-compose run --rm openvpn easyrsa build-client-full $CLIENTNAME nopass
--  Retrieve the client configuration with embedded certificates
--- docker-compose run --rm openvpn ovpn_getclient $CLIENTNAME > $CLIENTNAME.ovpn
-- See more here: https://github.com/kylemanna/docker-openvpn/blob/master/docs/docker-compose.md

docker-compose up
- Remember to create admin user and password for portainer(!) Or else, it's first come-first served.

## Backup
It is recommended to set up the Backup container to to take care of automatic remote backups of relevant files. To achieve this, simply mount existing docker volumes in ro-mode inside /data/ in the backup container and let the default cron-job do the rest (assuming the backup-container is able to rsync to the target).

## Restore
In order to restore do all installation first. Then stop all containers. Retrieve the backup and replace the new volumes with old data. Check permissions.
