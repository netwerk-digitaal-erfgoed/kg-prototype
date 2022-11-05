import Debug from 'debug';
import Handlebars from 'handlebars';
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
  graphUri?: string;
  subjectFilter?: string;
  endpointUrl: string;
  queryFile: string;
}

export class SparqlEndpointAnalyzer {
  protected debug: Debug.IDebugger;

  constructor() {
    this.debug = Debug(`app:${this.constructor.name}`);
  }

  async loadQueryFromFile(options: RunOptions): Promise<string> {
    const queryFile = resolve(options.queryFile);
    const data = await readFile(queryFile, {encoding: 'utf-8'});
    const template = Handlebars.compile(data);
    const templateData: Record<string, string> = {};

    if (options.graphUri) {
      templateData['graph-open'] = 'GRAPH ?graphUri {';
      templateData['graph-close'] = '}';
    }

    if (options.subjectFilter) {
      templateData['subject-filter'] = options.subjectFilter;
    }

    const query = template(templateData);
    return query;
  }

  async run(options: RunOptions): Promise<void> {
    const query = await this.loadQueryFromFile(options);

    this.debug(
      `Querying dataset "${options.datasetUri}" in "${options.endpointUrl}" using query file "${options.queryFile}"`
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
      httpTimeout: 60_000,
      initialBindings: BF.fromRecord({
        datasetUri: DF.namedNode(options.datasetUri),
        graphUri: DF.namedNode(options.graphUri!), // Can be undefined
      }) as unknown as Bindings,
    });

    const textStream = rdfSerializer.serialize(quadStream, {
      contentType: 'application/n-triples',
    });
    await pipeline(textStream, process.stdout);

    this.debug(
      `Done analyzing dataset "${options.datasetUri}" in "${options.endpointUrl}" using query file "${options.queryFile}"`
    );
  }
}
