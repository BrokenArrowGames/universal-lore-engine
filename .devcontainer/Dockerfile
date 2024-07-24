FROM node:22-slim

ENV PNPM_HOME="/workspaces/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apt-get update && apt-get install -y \
    vim \
    procps \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

ENV AWS_CONFIG_FILE="/workspaces/.aws/config"
ENV AWS_SHARED_CREDENTIALS_FILE="/workspaces/.aws/credentials"
ADD https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip /tmp/awscliv2.zip
RUN cd /tmp \
    && unzip ./awscliv2.zip \
    && ./aws/install

EXPOSE 3000
