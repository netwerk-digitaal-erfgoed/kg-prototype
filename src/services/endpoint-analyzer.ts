import Debug from 'debug';
import {SparqlEndpointFetcher} from 'fetch-sparql-endpoint';
import {stdout} from 'node:process';
import rdfSerializer from 'rdf-serialize';
import pTimeout from 'p-timeout';
import type {QueryLoader} from './query-loader';

export interface RunOptions {
  queryLoader: QueryLoader;
  datasetUri: string;
  graphUri?: string;
  subjectFilter?: string;
  endpointUrl: string;
  queryFile: string;
  timeout?: number; // In seconds
}

export class SparqlEndpointAnalyzer {
  protected debug: Debug.IDebugger;

  constructor() {
    this.debug = Debug('kg:endpoint-analyzer');
  }

  async run(options: RunOptions): Promise<void> {
    const timeoutInSeconds = options.timeout ?? 60;
    this.debug(
      `Querying dataset "${options.datasetUri}" in "${options.endpointUrl}" (timeout: ${timeoutInSeconds} seconds)`
    );

    const query = await options.queryLoader.get({
      file: options.queryFile,
      datasetUri: options.datasetUri,
      graphUri: options.graphUri,
      subjectFilter: options.subjectFilter,
    });

    const fetcher = new SparqlEndpointFetcher();

    try {
      const unresolvedTriplesStream = fetcher.fetchTriples(
        options.endpointUrl,
        query
      );
      const triplesStream = await pTimeout(
        unresolvedTriplesStream,
        timeoutInSeconds * 1000 // Timeout in milliseconds
      );
      const textStream = rdfSerializer.serialize(triplesStream, {
        contentType: 'application/n-triples',
      });

      // Cannot use Node's "await pipeline()": it swallows errors and fails silently
      return new Promise((resolve, reject) => {
        textStream.on('data', data => stdout.write(data));
        textStream.on('end', () => resolve());
        textStream.on('error', err => reject(err));
      });
    } catch (err) {
      const error = err as Error;
      this.debug(
        `Failed to analyze dataset "${options.datasetUri}" in endpoint "${options.endpointUrl}": ${error.message}`
      );
    }
  }
}
