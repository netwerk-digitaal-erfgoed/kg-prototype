import Debug from 'debug';
import {SparqlEndpointFetcher} from 'fetch-sparql-endpoint';
import rdfSerializer from 'rdf-serialize';
import pTimeout from 'p-timeout';
import type {QueryLoader} from './query-loader';
import stringifyStream from 'stream-to-string';

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
      const unresolvedQuadstream = fetcher.fetchTriples(
        options.endpointUrl,
        query
      );
      const quadStream = await pTimeout(
        unresolvedQuadstream,
        timeoutInSeconds * 1000 // Timeout in milliseconds
      );
      const textStream = rdfSerializer.serialize(quadStream, {
        contentType: 'application/n-triples',
      });
      const triples = await stringifyStream(textStream);
      process.stdout.write(triples);
    } catch (err) {
      const error = err as Error;
      this.debug(
        `Failed to analyze SPARQL endpoint "${options.endpointUrl}": ${error.message}`
      );
    }
  }
}
