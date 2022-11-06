import {Command, Flags} from '@oclif/core';
import {CatalogAnalyzer} from '../services/catalog-analyzer';
import * as Debug from 'debug';

Debug.enable('kg:*');

export class AnalyzeCatalogCommand extends Command {
  static description = 'Analyze SPARQL endpoints from a catalog';

  static flags = {
    catalogFile: Flags.string({
      description: 'File with a catalog',
      required: true,
    }),
    queryFile: Flags.string({
      description: 'File with a SPARQL query',
      required: true,
    }),
    timeout: Flags.integer({
      description: 'SPARQL endpoint timeout in seconds',
      required: false,
      default: 30
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AnalyzeCatalogCommand);
    const {catalogFile, queryFile, timeout} = flags;

    await new CatalogAnalyzer().run({catalogFile, queryFile, timeout});
  }
}
