FROM node:24-bookworm-slim

ARG SHIBUI_VERSION=0.72.2
ARG OCI_CREATED
ARG OCI_REVISION
ARG OCI_SOURCE=https://github.com/ShibuiTravel/agent

LABEL org.opencontainers.image.title="Shibui Agent" \
  org.opencontainers.image.description="Open-source Shibui coding agent CLI" \
  org.opencontainers.image.source="${OCI_SOURCE}" \
  org.opencontainers.image.revision="${OCI_REVISION}" \
  org.opencontainers.image.created="${OCI_CREATED}" \
  org.opencontainers.image.version="${SHIBUI_VERSION}" \
  org.opencontainers.image.licenses="MIT"

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    git \
    openssh-client \
    ripgrep \
    tini \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 10001 shibui \
  && useradd --uid 10001 --gid shibui --create-home --shell /bin/bash shibui \
  && mkdir -p /workspace /home/shibui/.shibui \
  && chown -R shibui:shibui /workspace /home/shibui/.shibui

RUN npm install -g --omit=optional "@shibuitravel/agent@${SHIBUI_VERSION}" \
  && npm cache clean --force

USER shibui
WORKDIR /workspace

ENV HOME=/home/shibui \
  SHIBUI_CODING_AGENT_DIR=/home/shibui/.shibui/agent

ENTRYPOINT ["/usr/bin/tini", "--", "shibui"]
