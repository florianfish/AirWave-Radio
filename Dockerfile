ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base:latest
FROM ${BUILD_FROM}

ENV LANG=C.UTF-8 \
    NODE_ENV=production \
    PORT=3000

# Install Node.js, npm and runtime tools
RUN apk add --no-cache \
    nodejs \
    npm \
    curl \
    bash \
    jq

WORKDIR /app

# Copy dependency manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Build Vite frontend & Node backend bundle
RUN npm run build

# Setup entrypoint script
COPY run.sh /run.sh
RUN chmod a+x /run.sh

EXPOSE 3000

CMD [ "/run.sh" ]
