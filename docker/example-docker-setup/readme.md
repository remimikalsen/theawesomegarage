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
The following modifications need to be done on the host OS for Redis to work properly.
- append vm.overcommit_memory=1 to /etc/sysctl.conf
- run following command as root on host: echo never > /sys/kernel/mm/transparent_hugepage/enabled
- Note that Docker uses the PREROUTE chain in iptables, which shortcuts limitations put in the INPUT chain. Thus, do not publish ports in docker-compose.yml that aren't supposed to be public. If you're behind a NAT firewall/router, you're probably good, but if you're connected directly to the internet, beware!

## Bind mounts
The containers in this stack will need a place to store persistent data. It is recommended to put this data in a directory outside of the Git-checkout dir - simply to avoid adding and pushing sensitive data to remote repo by accident.

Copy the folder my-config-templates to a suitable location on your host computer. E.g.
- cp -R <git-checkout-dir>/my-docker-data-template ~/my-docker-data

Specify the full path to your config directory in the MY_DOCKER_DATA_DIR variable on the second line in the docker-compose .env-file

## Clone external Git repositories
- Clone the Docker Grav repository into this directory, and name it "grav":
  - git clone https://github.com/getgrav/docker-grav.git grav
- Clone the Nginx VTS repo
  - git clone https://github.com/Parli/nginx-vts-docker.git nginx-vts
  - Update two lines in the Dockerfile
    - FROM alpine:3.5 >> FROM alpine:latest
    - ENV NGINX_VERSION 1.15.2 >> ENV NGINX_VERSION 1.15.11

## Applications included in this stack
- Owncloud (external, https)
  - Owncloud http
  - Owncloud db
  - Owncloud redis
- Basic Apache server with PHP support (external, https)
- Portainer (external, https)
- Cadvisor (port 8080, http)
- Nginx
  - Automatic vhost generator
  - Automatic Letsencrypt certs
- Nginx upstream server for executing redirects
- OpenVPN
  - An OpenVPN server
- Montitoring and logging
  - Sematext monitoring agent
  - Sematext log agent
- Grav
  - Grav is a no database flat file CMS system. The grav image enables you to [create a self hosted web page](https://theawesomegarage.com/blog/my-first-blog-post).
- Ouroboros
  - Outorobos is a tool for automatically updating and deploying updates to your containers
- Docker registry
  - A docker registry lets you push your own base images based upon custom builds with Docker files
  - The registry is set up to be private, and proxied by NginX without size limitations on the resulting images

## Installation
Before running docker-compose up, initialize containers that need initializing:
- OpenVPN-server
  - docker-compose run --rm openvpn-server ovpn_genconfig -u udp://VPN.SERVERNAME.COM
  - docker-compose run --rm openvpn-server ovpn_initpki
  - sudo chown -R $(whoami): ../my-docker-data/openvpn-server
  - Create OpenVPN-server client certs
    - export CLIENTNAME="your_client_name"
    - with a passphrase (recommended)
      - docker-compose run --rm openvpn easyrsa build-client-full $CLIENTNAME
    - without a passphrase (not recommended)
      - docker-compose run --rm openvpn easyrsa build-client-full $CLIENTNAME nopass
  - Retrieve the client configuration with embedded certificates
    - docker-compose run --rm openvpn ovpn_getclient $CLIENTNAME > $CLIENTNAME.ovpn
  - See more here: https://github.com/kylemanna/docker-openvpn/blob/master/docs/docker-compose.md
- Grav
  - You need to download the grav package and mount it to the grav container
    - cd ${MY_DOCKER_DATA_DIR} && git clone https://github.com/getgrav/grav.git grav
    - This is the Grav source code. The previous grav checkout was a pre-configured Grav container build (also with source code incorporated, but this second check out of source code is going to be persistently stored and updated outside your container).

You need to adjust Nginx-settings if you intend to use Owncloud with files bigger than 2 megabytes:
- Read and rename the following file according to instructions:
  - ~/my-docker-data/nginx/vhost.d/owncloud.vhost.com

You need to adjust Nginx-settings if you intend to set up a private docker registry:
- Read and rename the following file according to instructions:
  - ~/my-docker-data/nginx/vhost.d/registry.vhost.com
- You also need to generate credentials for your private registry:
  - docker run --entrypoint htpasswd  registry:2 -Bbn <username> <password> > ~/my-docker-data/registry/auth/.htpasswd

Prometheus is set up to run on a public IP.
- Read and rename the following file according to instructions:
  - ~/my-docker-data/nginx/vhost.d/prometheus.vhost.com
- Read and do the following:
  - ~/my-docker-data/nginx/auth/README

docker-compose up -d
- Remember to create admin user and password for portainer(!) Or else, it's first come-first served. The server shuts down after 5 minutes if you do not register an admin account within that timeframe.

Cache your docker credentials by logging in to your private docker repository - making them available to Ouroboros
 - docker login -u<username> -p<password> your.docker.vhost.com

## Backup
Mostly, it will be good enough to back up the my-docker-data directory. Check out this rsync script: https://github.com/remimikalsen/theawesomegarage/blob/master/the-infamous-others/rsync_backup.sh

## Restore
In order to restore a corrupt system, you are mostly good with backing up the my-docker-data directory.
1) Make sure you have have the docker files: git clone https://github.com/remimikalsen/theawesomegarage.git docker-setup
2) Make sure you have done the necessary configurations in docker-setup/.env
3) Restore the my-docker-data directory and make sure your .env file points to this data directory
4) Run docker-compose up -d from within the docker-setup directory

## Housekeeping
In general, you want to be warned when something goes wrong. Set up Postfix to send you important e-mails on cron jobs etc.
- Check out this article: https://www.linode.com/docs/email/postfix/configure-postfix-to-send-mail-using-gmail-and-google-apps-on-debian-or-ubuntu/
- After you have an MTA installed, remember to rediret local mail sent to root, www-data, etc. to an inbox you check daily:
  - sudo vi /etc/aliases
  - sudo newaliases

In order to keep the host system updated, I suggest installing apticron:
- sudo apt-get install apticron
- sudo vi /etc/apticron/apticron.conf
This way, you'll be notified when there are important updates.

If you are hosting your docker servers at home, you probably have a dynamic IP address. If you are a GoDaddy customer, this repo is gold:
 - https://github.com/markafox/GoDaddy_Powershell_DDNS (NOTE! There is a bash variant alongside the Powershell one. The bash version works perfectly on Ubuntu 18.04).
 - Read the readme and run the script every 15 minutes in cron and your A records can point to your ever changing IP address. It's a poor  man's DDNS-service!

In order to update all your docker containers regularly, you can either do monitoring and take action as needed, use pyouroboros, Kubernetes or just do [blind updates at a regular interval with cron](https://theawesomegarage.com/blog/updating-your-docker-containers-automatically). I've included an upgrade script with the docker example setup that does the latter. Just fill in the configuration variables and let it run in cron.
Of course, this blind update method will impact uptime (although very slightly) and eventually it will break your setup (because eventually, some latest tag will introduce changes that are incompatible with your rig). The script attempts to send you emails both when errors occur and to report success. If you use the Ouroboros + Docker registry rig [included in this setup](https://theawesomegarage.com/blog/updating-your-docker-containers-automatically-v2), you don't need other automatic update mechanisms for your containers.

## Nginx container for redirects
I love that my front-end Nginx-container vhosts and certificates are automatically configured by the nginx-gen and nginx-ssl containers. If I really, really need to tweak a vhost configuration, it better be some critical setting regarding one of the already existing vhosts (as was the case with the max body size on Owncloud).

However, I came across a case that tempted me to do some hacking. I have a web page hosted on Wordpress.org: https://remimikalsen.com. On Wordpress it costs money to map domains to your account, and it so happens that I also own a short hand domain, remim.com, that I also wanted to point to my Wordpress site. My initial thought was to let my existing Nginx container handle the redirect. However, I soon realied that would become a mess. Instead I set up an upstream Nginx-server that my front end Nginx talks to.

With this setup, I gain super easy SSL-certificates for my redirect domains, consistent logging and it's much easier to detect where in the pipe errors arise. And last, but not the least, the configuration for my upstream redirect server is super-easy and doesn't mess with my nginx, nginx-gen, nginx-ssl setup. And actually, I have come to learn that more people recommend this pattern.

## Known problems
### No DNS resolution on Ubuntu 18.04 OpenVPN client
If you are able to ping an IP-address, but not the corresponding Domain name, you fall into this category.
OpenVPN can't by itself resolve DNS-issues on Ubuntu 18.04 clients. You need to take additional steps. This is one way of fixing it:
- On the client, run:
  - sudo mkdir -p /etc/openvpn/scripts
  - sudo wget https://raw.githubusercontent.com/jonathanio/update-systemd-resolved/master/update-systemd-resolved -P /etc/openvpn/scripts/
  - sudo chmod +x /etc/openvpn/scripts/update-systemd-resolved

Then, change change your client's ovpn-file and append the following to the bottom:
script-security 2
up /etc/openvpn/scripts/update-systemd-resolved
down /etc/openvpn/scripts/update-systemd-resolved

Note! If you already have a script-security section, place up and down in that section
Note2! If you already have up and down definitions, comment the old ones out and use the aforementioned definitions.

### Owncloud sync fails and client reports 413 Request Entity Too Large
This happens because the official Owncloud docker image is set up to accept file uploads of 20G. However, Nginx will by defauly only allow body sizes (uploads/downloads) of 2M. The best way to resolve this is to specify to Nginx that Owncloud needs bigger body sizes. You can do this by adding a file to the /etc/nginx/vhost.d/ directory, named after the vhost Owncloud runs on. In theawesomegarage, this is fixed by renaming a single pre-defined file:
- On the host, read and rename the following file according to your vhost setup:
  - ~/my-docker-data/nginx/vhost.d/my.vhost.com

Note! If you need to specify other Nginx-configurations per vhost, this is the easiest way to go about it. Restart the nginx-container after making changes.
