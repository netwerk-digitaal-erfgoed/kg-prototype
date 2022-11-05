# Knowledge Graph: a prototype

## Docker

### Install

    docker run --rm -it -v "$PWD":/app -w /app node:lts-alpine npm install --no-progress

### Login

    docker run --rm -it -v "$PWD":/app -w /app node:lts-alpine /bin/sh

## Commands

### Analyze data in a SPARQL endpoint

#### Example

    ./analyzer/bin/dev analyze-endpoint --datasetUri "http://data.muziekschatten.nl/" --endpointUrl "http://data.muziekschatten.nl/sparql" --queryFile "./queries/class_occurences.rq"

### Analyze data in all SPARQL endpoints in a catalog

#### Example

    ./analyzer/bin/dev analyze-catalog --catalogFile "./analyzer/catalog.json" --queryFile "./queries/class_occurences.rq"
