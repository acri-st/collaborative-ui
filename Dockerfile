ARG CI_COMMIT_SHORT_SHA=xxxxxx
ARG CI_COMMIT_TAG=0.0.0
ARG NODE_BASE_VERSION=18.14.2
# =============================================
# -- PHASE 1 : build project
# =============================================
FROM harbor.shared.acrist-services.com/proxy-cache/node:$NODE_BASE_VERSION AS builder
ENV GIT_HASH=$CI_COMMIT_SHORT_SHA
ENV VERSION=$CI_COMMIT_TAG
WORKDIR /opt/usr/
ARG BRANCH_ID
ARG BRANCH_NAME
ARG BUILD_TAG
COPY ./package*.json ./
COPY ./.npmrc .npmrc
RUN npm ci
COPY . .
RUN npm run build

# =================================================
# -- PHASE 2 : copy build then serve on nginx
# =================================================
FROM harbor.shared.acrist-services.com/proxy-cache/nginx:1.27-alpine
EXPOSE 80
# Nginx conf is loaded from the config map in deployment
WORKDIR /usr/share/nginx/html
# As we are not running as root we need to grant the user on the docroot
RUN chown -R nginx .
# As we are not running as root we can't add more folder to this one
RUN chown -R 102022  /var/cache/nginx/ /var/log/nginx
COPY --from=BUILDER /opt/usr/dist/ .
