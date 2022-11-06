import Debug from 'debug';
import Handlebars from 'handlebars';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

export interface LoadOptions {
  file: string;
  datasetUri: string;
  graphUri?: string;
  subjectFilter?: string;
}

type ToQueryOptions = {
  compiledQueryTemplate: HandlebarsTemplateDelegate;
} & Pick<LoadOptions, 'datasetUri' | 'graphUri' | 'subjectFilter'>;

export class QueryLoader {
  protected debug: Debug.IDebugger;
  protected cache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.debug = Debug('kg:query-loader');
  }

  protected async fromFile(file: string): Promise<HandlebarsTemplateDelegate> {
    this.debug(`Loading query from file "${file}"`);
    const queryTemplate = await readFile(file, {encoding: 'utf-8'});
    return Handlebars.compile(queryTemplate);
  }

  protected toQuery(options: ToQueryOptions): string {
    const data: Record<string, string> = {
      'dataset-uri': `<${options.datasetUri}>`,
    };

    if (options.graphUri) {
      data['graph-open'] = `GRAPH <${options.graphUri}> {`;
      data['graph-close'] = '}';
    }

    if (options.subjectFilter) {
      data['subject-filter'] = options.subjectFilter;
    }

    const query = options.compiledQueryTemplate(data);
    return query;
  }

  async get(options: LoadOptions): Promise<string> {
    const file = resolve(options.file);

    let compiledQueryTemplate = this.cache.get(file);
    if (compiledQueryTemplate === undefined) {
      compiledQueryTemplate = await this.fromFile(file);
      this.cache.set(file, compiledQueryTemplate);
    }

    const toQueryOptions = {
      compiledQueryTemplate,
      datasetUri: options.datasetUri,
      graphUri: options.graphUri,
      subjectFilter: options.subjectFilter,
    };
    return this.toQuery(toQueryOptions);
  }
}
