
FROM hoosin/alpine-nginx-nodejs
LABEL maintainer="ACRI ST"

RUN apk update && \
    apk add --no-cache inotify-tools

# Expose port 80 for nginx, 8100 for the vite server
EXPOSE 80 8100


WORKDIR /frontend/
ENTRYPOINT sh ./entrypoint.sh
