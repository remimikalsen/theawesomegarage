Before running filebeat the first time:
- verify your filebeat.yml settings
- make sure the filebeat.yml and manifest files in the modules sub-directories are owned by and only writable by root
- docker-compose run filebeat setup --template
- docker-compose run filebeat setup -e


If you enable modules, run:
 - docker-compose run filebeat setup -e

If you have trouble in Kibana with missing fields like geoip.location
- docker stop filebeat
- In Kibana console, run
  - DELETE _template/*
  - DELETE _ALL
- docker restart kibana
- docker-compose run filebeat setup --template
- docker-compose run filebeat setup -e
- docker-compose up -d
