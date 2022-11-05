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

    ./analyzer/bin/dev analyze-endpoint --datasetUri "http://data.muziekschatten.nl/" --endpointUrl "https://api.lod.uba.uva.nl/datasets/UB-UVA/Catalogue/services/virtuoso/sparql" --graphUri "https://lod.uba.uva.nl/UB-UVA/Incunabula/graphs/default" --queryFile "./queries/class_occurences.rq"

### Analyze data in all SPARQL endpoints in a catalog

#### Example

    ./analyzer/bin/dev analyze-catalog --catalogFile "./datacatalog.ttl" --queryFile "./queries/class_occurences.rq"
