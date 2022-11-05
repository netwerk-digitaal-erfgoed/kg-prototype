import Debug from 'debug';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {SparqlEndpointAnalyzer} from '../services/analyze-endpoint';

export interface RunOptions {
  catalogFile: string;
  queryFile: string;
}

export class CatalogAnalyzer {
  protected debug: Debug.IDebugger;

  constructor() {
    this.debug = Debug(`app:${this.constructor.name}`);
  }

  async run(options: RunOptions): Promise<void> {
    const catalogFile = resolve(options.catalogFile);

    this.debug(`Reading catalog "${catalogFile}"`);
    const data = await readFile(catalogFile, {encoding: 'utf-8'});
    const catalog = JSON.parse(data);

    const endpoints = catalog.endpoints;
    for (const endpoint of endpoints) {
      const {datasetUri, endpointUrl} = endpoint;

      try {
        await new SparqlEndpointAnalyzer().run({
          datasetUri,
          endpointUrl,
          queryFile: options.queryFile,
        });
      } catch (err) {
        const error = err as Error;
        this.debug(
          `Failed to analyze SPARQL endpoint "${endpointUrl}": ${error.message}`
        );
      }
    }
  }
}
