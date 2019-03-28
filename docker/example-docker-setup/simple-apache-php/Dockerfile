FROM php:7.2-apache

# Use the default production configuration from the docker image
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

RUN docker-php-ext-install opcache

# Override with custom opcache settings (variable substitution occurs in opchace.ini)
ENV PHP_OPCACHE_VALIDATE_TIMESTAMPS="0" \
    PHP_OPCACHE_MAX_ACCELERATED_FILES="10000" \
    PHP_OPCACHE_MEMORY_CONSUMPTION="192" \
    PHP_OPCACHE_MAX_WASTED_PERCENTAGE="10"
COPY /config/opcache.ini $PHP_INI_DIR/conf.d/
