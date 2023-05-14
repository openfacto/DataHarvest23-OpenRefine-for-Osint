# DATAHARVEST 2023

## Introduction

If you are attending the OpenRefine sessions at Dataharvest, and not using the pre-installed computers from the lab, this repository will help you installing OpenRefine on your computer.

__Please note that a regular OpenRefine install will work fine out-of-the-box for the beginner session.__


## Installation using Docker

With this repository, we will help you install a pimped docker version of [OpenRefine](https://openrefine.org/), in a docker container for the OSINT session.

What do I mean by "pimped"? well...

This version adds a plugin called vib-bits, some command line tools (cli) such as ddgr, and trafilatura to boost OpenRefine's potential.

The container also embeds a TOR service that allows you to *torify* command line instruction (for anonymization).


### Requisites

- You need Docker on your machine. Please visit this page in order to do so : 

https://docs.docker.com/desktop/

- You may also need git (not mandatory but useful)

https://git-scm.com/downloads


### Installation 

1 - Clone the repository: ```git clone https://git.oh-w.tf/herve/Refine-Osint.git```
(you can also download the zip archive and unzip it on your hard disk).

2 - Build the image: ```docker-compose build```

We will you the last version of OpenRefine (3.7.2)

3- Enjoy a cup of coffee, the container takes up to 4mn to build...


### Start/Stop the container 


This project also includes a docker-compose file that allows you to easily pass some parameters to the container, such as the OpenRefine version, memory and cpu limits, etc...

```
docker-compose --compatibility up -d
```

To stop the stack, simply type : 

```
docker-compose down
```

### Connect to OpenRefine

You can now access OpenRefine by browsing the following URL in Firefox or Chrome : 

```
http://127.0.0.1
```

## Regular installation
If you don't want to use docker, you can also install OpenRefine, as well as all plugins and CLI tools directly on your computer.
Please be aware of the fact that not every tools are available in that case.


- OpenRefine : https://openrefine.org
- Python+pip : https://python.org


OpenRefine uses Java to work so you might use it on all traditional platforms (Mac, Linux and Windows).
Installation is detailed [here](https://openrefine.org/documentation.html).

### Enhancements

#### Plugins

We do recommend to install the [vib-bits plugin](https://www.bits.vib.be/software-overview/openrefine), that will allow you to easily cross-match data between your different projects (aka join tables...).

- The [vib-bits plugin](http://data.bits.vib.be/hidden/g7dt6RjuUTU421dY2CwrGePGX/vib-bits.zip) itself.
- The [documentation](http://data.bits.vib.be/hidden/g7dt6RjuUTU421dY2CwrGePGX/OpenRefine%20VIB-BITS%20plugin.pdf)

#### CLI tools

For this demo, we also recommend to install several tools on your machine (not mandatory, though...) : 

- It's generally a good idea to have wget, curl, grep (or ripgrep), tar, python3 and python3-pip on your machines
- whois, dnsutils, and geoip-bin
- [ddgr](https://github.com/jarun/ddgr/releases), to interact with duckduckgo using the command line
- [trafilatura](https://trafilatura.readthedocs.io/en/latest/) , a tool to scrape text from webpage.

Our Docker version now includes [JQ](https://stedolan.github.io/jq/) for parsing json files., and [JC](https://github.com/kellyjonbrazil/jc), a tool that jsonize the command line output.

#### TOR

I usually find useful to have a TOR service that allow you to *torify* command line instruction.

Example : ```torify curl https://ipinfo.io/ip``` will display your IP via TOR.



## Let's play with Refine!

Now that OpenRefine is installed on your machine, let's practice using some examples and use-cases.

- ONE - [How to Geocode and enrich using APIs](Demos/Demos1.md).
- TWO - [Let's import some OSINT-obtained json data and map them](Demos/Demos2.md).
- THREE - [How about using more APIs to enrich your data](Demos/Demos3.md)?
- FOUR - [Cherry on the cake; let's enrich our data using the command line](Demos/Demos4.md)!
- FIVE - [Scrape & Enrich your data using TRAFILATURA]((Demos/Demos3.md))


## Hints

### Anonimizing your requests using TOR

You can send your commands anonymously by wrapping it in TOR with the command torify.

Example : 

```
torify curl --silent  http://monip.org

```

The retrieved IP address in that case should be very different than the IP retrieved by a simple ``` curl --silent  http://monip.org ```.  


A good way to anonymize your request using TOR, is to use this command to refresh the IP address for every requests : 

```
killall -HUP tor 
```

This command refreshes the TOR ip Address.

For instance, let's consider a project to test this, by creating a new project with two identical lines : 

```
killall -HUP tor && torify curl --silent  http://monip.org

killall -HUP tor && torify curl --silent  http://monip.org

```

If we apply the jython script to this, the IP address will be different for both lines. 


### Trafilatura 


[Trafilatura](https://trafilatura.readthedocs.io/en/latest/) is a command-line tool that allows you to scrape webpages (for example to retrieve the full text of an article)

Install it with pip3 (Python) :

```pip3 install trafilatura```

