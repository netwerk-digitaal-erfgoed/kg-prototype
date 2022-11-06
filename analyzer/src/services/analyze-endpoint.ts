import Debug from 'debug';
import {SparqlEndpointFetcher} from 'fetch-sparql-endpoint';
import Handlebars from 'handlebars';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import rdfSerializer from 'rdf-serialize';
import pTimeout from 'p-timeout';
import stringifyStream from 'stream-to-string';

export interface RunOptions {
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
    this.debug = Debug('kg:analyzer');
  }

  async loadQueryFromFile(options: RunOptions): Promise<string> {
    const queryFile = resolve(options.queryFile);
    const data = await readFile(queryFile, {encoding: 'utf-8'});
    const template = Handlebars.compile(data);
    const templateData: Record<string, string> = {};

    templateData['dataset-uri'] = `<${options.datasetUri}>`;

    if (options.graphUri) {
      templateData['graph-open'] = `GRAPH <${options.graphUri}> {`;
      templateData['graph-close'] = '}';
    }

    if (options.subjectFilter) {
      templateData['subject-filter'] = options.subjectFilter;
    }

    const query = template(templateData);
    return query;
  }

  async run(options: RunOptions): Promise<void> {
    const timeoutInSeconds = options.timeout ?? 60;
    const query = await this.loadQueryFromFile(options);

    this.debug(
      `Querying dataset "${options.datasetUri}" in "${options.endpointUrl}" (timeout: ${timeoutInSeconds} seconds)`
    );

    const fetcher = new SparqlEndpointFetcher();

    try {
      const unresolvedQuadstream = fetcher.fetchTriples(options.endpointUrl, query);
      const quadStream = await pTimeout(unresolvedQuadstream, timeoutInSeconds * 1000); // Timeout as milliseconds
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
