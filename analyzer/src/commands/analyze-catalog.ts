import {Command, Flags} from '@oclif/core';
import {CatalogAnalyzer} from '../services/catalog-analyzer';
import * as Debug from 'debug';

Debug.enable('app:*');

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
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AnalyzeCatalogCommand);
    const {catalogFile, queryFile} = flags;

    await new CatalogAnalyzer().run({catalogFile, queryFile});
  }
}
