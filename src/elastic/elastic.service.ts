import { Injectable } from '@nestjs/common';
import { Document } from './elastic.interface';
import * as elasticsearch from 'elasticsearch';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ElasticService {
  private readonly esclient: elasticsearch.Client;
  constructor(private configService: ConfigService) {
    this.esclient = new elasticsearch.Client({
      host: this.configService.getOrThrow<string>('ELASTIC_SEARCH_URL'),
    });
  }

  async createIndex(index: string) {
    await this.esclient.indices.create({ index });
  }

  async bulkInsert(index: string, documents: Document[]) {
    const processedDocuments = documents.flatMap((doc) => [{ index: { _index: index } }, doc]);
    await this.esclient.bulk({ body: processedDocuments });
  }

  async insert(index: string, document: Document) {
    await this.esclient.index({ index, body: document, type: 'test' });
  }

  async search(index: string, text: string) {
    const response = await this.esclient.search({
      index,
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['email', 'surname'],
          },
        },
      },
    });
    return response;
  }
}
