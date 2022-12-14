import {Command, Flags} from '@oclif/core';
import {SparqlEndpointAnalyzer} from '../services/endpoint-analyzer';
import {QueryLoader} from '../services/query-loader';
import * as Debug from 'debug';

Debug.enable('kg:*');

export class AnalyzeEndpointCommand extends Command {
  static description = 'Analyze a SPARQL endpoint';

  static flags = {
    datasetUri: Flags.string({
      description: 'IRI of the dataset',
      required: true,
    }),
    graphUri: Flags.string({
      description: 'IRI of the graph',
      required: false,
    }),
    subjectFilter: Flags.string({
      description: 'Triples to filter the subject by',
      required: false,
    }),
    endpointUrl: Flags.string({
      description: 'URL of the SPARQL endpoint',
      required: true,
    }),
    queryFile: Flags.string({
      description: 'File with a SPARQL CONSTRUCT query',
      required: true,
    }),
    timeout: Flags.integer({
      description: 'SPARQL endpoint timeout in seconds',
      required: false,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AnalyzeEndpointCommand);
    const {
      datasetUri,
      graphUri,
      subjectFilter,
      endpointUrl,
      queryFile,
      timeout,
    } = flags;

    const queryLoader = new QueryLoader();
    const sparqlEndpointAnalyzer = new SparqlEndpointAnalyzer();

    await sparqlEndpointAnalyzer.run({
      queryLoader,
      datasetUri,
      graphUri,
      subjectFilter,
      endpointUrl,
      queryFile,
      timeout,
    });
  }
}
