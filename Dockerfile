FROM debian:bullseye-slim
MAINTAINER openfacto <openfacto@openfacto.fr>

ENV refine_version=3.7.2
ENV DEBIAN_FRONTEND=noninteractive
ENV OR_URL=https://github.com/OpenRefine/OpenRefine/releases/download/$refine_version/openrefine-linux-$refine_version.tar.gz


ENV LANG fr_FR.utf8

WORKDIR /app

RUN apt update && \
    apt install --no-install-recommends -y ca-certificates \
    apt-utils \
    bash \
    locales \
    wget \
    curl \
    grep \
    tar \
    whois \
    python3 \
    python3-pip \
    python3-setuptools\
    default-jdk \
    dnsutils \
    geoip-bin \
    jq \
    psmisc \
    ntp \
    netbase \
    git \
    tor \
    torsocks && \
    localedef -i fr_FR -c -f UTF-8 -A /usr/share/locale/locale.alias fr_FR.UTF-8 

RUN curl -sSL ${OR_URL} | tar xz --strip 1 

RUN wget https://github.com/jarun/ddgr/releases/download/v1.9/ddgr_1.9-1_ubuntu20.04.amd64.deb && \
    apt install --no-install-recommends -y ./ddgr_1.9-1_ubuntu20.04.amd64.deb  
    
RUN pip3 install jc && \
    pip3 install trafilatura


COPY torrc /etc/tor/torrc
COPY torsocks.conf /etc/tor/torsocks.conf
COPY tor.sh /app/tor.sh

RUN chmod +x /app/tor.sh


VOLUME /data

ADD data/extensions /data



EXPOSE 3333

ENTRYPOINT ["/app/tor.sh", "&"]
