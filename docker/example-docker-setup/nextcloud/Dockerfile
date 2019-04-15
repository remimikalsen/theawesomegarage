FROM nextcloud:fpm

RUN set -ex; \
  apt-get update \
  && apt-get install -y ssmtp  \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/?*

COPY ssmtp.conf /etc/ssmtp/ssmtp.conf
