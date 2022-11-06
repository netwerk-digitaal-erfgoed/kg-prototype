import fs from 'fs';
import Debug from 'debug';
import {resolve} from 'node:path';
import {SparqlEndpointAnalyzer} from '../services/analyze-endpoint';
import rdfParser from 'rdf-parse';
import {storeStream} from 'rdf-store-stream';
import * as RDF from '@rdfjs/types';
import {QueryEngine} from '@comunica/query-sparql-rdfjs';

export interface RunOptions {
  catalogFile: string;
  queryFile: string;
  timeout?: number; // In seconds
}

export class CatalogAnalyzer {
  protected debug: Debug.IDebugger;

  constructor() {
    this.debug = Debug('kg:catalog');
  }

  async loadCatalogfromFile(file: string): Promise<RDF.Store> {
    this.debug(`Loading catalog from "${file}"`);

    const quadStream = rdfParser.parse(fs.createReadStream(file), {
      path: file,
    });

    return storeStream(quadStream);
  }

  async getEndpointsFromCatalog(catalog: RDF.Store): Promise<RDF.Bindings[]> {
    const query = `
      PREFIX dcat: <http://www.w3.org/ns/dcat#>
      PREFIX nde: <https://www.netwerkdigitaalerfgoed.nl/def#>
      PREFIX schema: <https://schema.org/>

      SELECT ?datasetUri ?endpointUrl ?graphUri ?subjectFilter
      WHERE {
        ?datasetUri a dcat:Dataset ;
          dcat:distribution ?distribution .
        ?distribution dcat:accessURL ?endpointUrl .
        OPTIONAL { ?distribution nde:graphUri ?graphUri }
        OPTIONAL { ?distribution nde:subjectFilter ?subjectFilter }
      }
    `;

    const queryEngine = new QueryEngine();
    const bindingsStream = await queryEngine.queryBindings(query, {
      sources: [catalog],
    });
    const endpoints = await bindingsStream.toArray();
    return endpoints;
  }

  async run(options: RunOptions): Promise<void> {
    const catalogFile = resolve(options.catalogFile);
    const catalog = await this.loadCatalogfromFile(catalogFile);
    const endpoints = await this.getEndpointsFromCatalog(catalog);

    this.debug(
      `Analyzing ${endpoints.length} endpoints in catalog "${catalogFile}"`
    );

    for (const endpoint of endpoints) {
      const datasetUri = endpoint.get('datasetUri')!.value.toString();
      const endpointUrl = endpoint.get('endpointUrl')!.value.toString();

      let graphUri = undefined;
      const graphUriTerm = endpoint.get('graphUri');
      if (graphUriTerm !== undefined) {
        graphUri = graphUriTerm.value.toString();
      }

      let subjectFilter = undefined;
      const subjectFilterTerm = endpoint.get('subjectFilter');
      if (subjectFilterTerm !== undefined) {
        subjectFilter = subjectFilterTerm.value.toString();
      }

      const sparqlEndpointAnalyzer = new SparqlEndpointAnalyzer();
      await sparqlEndpointAnalyzer.run({
        datasetUri,
        graphUri,
        subjectFilter,
        endpointUrl,
        queryFile: options.queryFile,
        timeout: options.timeout,
      });
    }
  }
}
