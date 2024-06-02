FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

RUN apt-get update && apt-get install -y \
  ruby-full \
  && rm -rf /var/lib/apt/lists/*

ENV GEM_HOME="/home/node/gems"
ENV PATH="/home/node/gems/bin:$PATH"
  
USER node
RUN gem install jekyll bundler
