import {Command, Flags} from '@oclif/core';
import {SparqlEndpointsAnalyzer} from '../services/endpoints-analyzer';
import * as Debug from 'debug';

Debug.enable('kg:*');

export class AnalyzeEndpointsCommand extends Command {
  static description = 'Analyze SPARQL endpoints from a catalog';

  static flags = {
    catalogFile: Flags.string({
      description: 'File with a catalog',
      required: true,
    }),
    queryFile: Flags.string({
      description: 'File with a SPARQL CONSTRUCT query',
      required: true,
    }),
    timeout: Flags.integer({
      description: 'SPARQL endpoint timeout in seconds',
      required: false,
      default: 60,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AnalyzeEndpointsCommand);
    const {catalogFile, queryFile, timeout} = flags;

    const sparqlEndpointsAnalyzer = new SparqlEndpointsAnalyzer();
    await sparqlEndpointsAnalyzer.run({catalogFile, queryFile, timeout});
  }
}
