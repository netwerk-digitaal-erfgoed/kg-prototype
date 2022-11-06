# Knowledge Graph: a prototype

Repository for prototyping a pipeline to run bulk analyses on datasets

## Docker

Optional - if you don't have Node installed locally.

### Install

    docker run --rm -it -v "$PWD":/app -w /app node:lts-alpine npm install --no-progress

### Login

    docker run --rm -it -v "$PWD":/app -w /app node:lts-alpine /bin/sh

## Commands

Logging goes to `stderr`, results to `stdout`.

### Analyze data in a SPARQL endpoint

    bin/dev analyze-endpoint --datasetUri {uri} --endpointUrl {url} --queryFile {file}
    bin/dev analyze-endpoint --datasetUri {uri} --endpointUrl {url} --queryFile {file} --timeout {seconds}
    bin/dev analyze-endpoint --datasetUri {uri} --endpointUrl {url} --queryFile {file} --graphUri {uri}
    bin/dev analyze-endpoint --datasetUri {uri} --endpointUrl {url} --queryFile {file} --subjectFilter {string}

#### Examples

    bin/dev analyze-endpoint --datasetUri "http://data.muziekschatten.nl/" --endpointUrl "http://data.muziekschatten.nl/sparql" --queryFile "queries/class_occurences.rq"

    bin/dev analyze-endpoint --datasetUri "https://lod.uba.uva.nl/UB-UVA/Incunabula/" --endpointUrl "https://api.lod.uba.uva.nl/datasets/UB-UVA/Catalogue/services/virtuoso/sparql" --graphUri "https://lod.uba.uva.nl/UB-UVA/Incunabula/graphs/default" --queryFile "queries/class_occurences.rq"

    bin/dev analyze-endpoint --datasetUri "http://data.bibliotheken.nl/id/dataset/dbnla" --endpointUrl "http://data.bibliotheken.nl/sparql" --subjectFilter "?subject schema:mainEntityOfPage/schema:isPartOf <http://data.bibliotheken.nl/id/dataset/dbnla>" --queryFile "queries/class_occurences.rq" --timeout 180

### Analyze data in all SPARQL endpoints from a catalog

Beware: this could take some time.

    bin/dev analyze-endpoints --catalogFile {file} --queryFile {file}
    bin/dev analyze-endpoints --catalogFile {file} --queryFile {file} --timeout {seconds}

#### Examples

    bin/dev analyze-endpoints --catalogFile "catalogs/sparql-endpoints.ttl" --queryFile "queries/class_occurences.rq"
    bin/dev analyze-endpoints --catalogFile "catalogs/sparql-endpoints.ttl" --queryFile "queries/objects_string_occurences.rq"
    bin/dev analyze-endpoints --catalogFile "catalogs/sparql-endpoints.ttl" --queryFile "queries/objects_uris_occurences.rq"
    bin/dev analyze-endpoints --catalogFile "catalogs/sparql-endpoints.ttl" --queryFile "queries/property_occurences.rq"
    bin/dev analyze-endpoints --catalogFile "catalogs/sparql-endpoints.ttl" --queryFile "queries/unique_properties.rq"
