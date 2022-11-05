import {Command, Flags} from '@oclif/core';
import {SparqlEndpointAnalyzer} from '../services/analyze-endpoint';
import * as Debug from 'debug';

Debug.enable('app:*');

export class AnalyzeEndpointCommand extends Command {
  static description = 'Analyze a SPARQL endpoint';

  static flags = {
    datasetUri: Flags.string({
      description: 'IRI of the dataset',
      required: true,
    }),
    endpointUrl: Flags.string({
      description: 'URL of the SPARQL endpoint',
      required: true,
    }),
    queryFile: Flags.string({
      description: 'File with a SPARQL query',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AnalyzeEndpointCommand);
    const {datasetUri, endpointUrl, queryFile} = flags;

    await new SparqlEndpointAnalyzer().run({
      datasetUri,
      endpointUrl,
      queryFile,
    });
  }
}
