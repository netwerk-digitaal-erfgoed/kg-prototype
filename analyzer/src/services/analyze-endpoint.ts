import Debug from 'debug';
import {QueryEngine} from '@comunica/query-sparql';
import {BindingsFactory} from '@comunica/bindings-factory';
import {DataFactory} from 'rdf-data-factory';
import {Bindings} from '@rdfjs/types';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pipeline} from 'node:stream/promises';
import rdfSerializer from 'rdf-serialize';

export interface RunOptions {
  datasetUri: string;
  endpointUrl: string;
  queryFile: string;
}

export class SparqlEndpointAnalyzer {
  protected debug: Debug.IDebugger;

  constructor() {
    this.debug = Debug(`app:${this.constructor.name}`);
  }

  async run(options: RunOptions): Promise<void> {
    const queryFile = resolve(options.queryFile);
    const query = await readFile(queryFile, {encoding: 'utf-8'});

    this.debug(
      `Querying dataset "${options.datasetUri}" in "${options.endpointUrl}" using query file "${queryFile}"`
    );

    const DF = new DataFactory();
    const BF = new BindingsFactory();
    const engine = new QueryEngine();

    const quadStream = await engine.queryQuads(query, {
      sources: [
        {
          type: 'sparql',
          value: options.endpointUrl,
        },
      ],
      httpTimeout: 10_000, // 10 seconds
      initialBindings: BF.fromRecord({
        datasetUri: DF.namedNode(options.datasetUri),
      }) as unknown as Bindings,
    });

    const textStream = rdfSerializer.serialize(quadStream, {
      contentType: 'application/n-triples',
    });
    await pipeline(textStream, process.stdout);

    this.debug(
      `Done analyzing dataset "${options.datasetUri}" in "${options.endpointUrl}" using query file "${queryFile}"`
    );
  }
}
