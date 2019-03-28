FROM alpine:3.5

RUN apk add --no-cache --virtual .run-deps rsync openssh tzdata curl
COPY docker-entrypoint.sh /

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["sh"]
