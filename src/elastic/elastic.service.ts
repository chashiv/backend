import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Document } from './elastic.interface';

@Injectable()
export class ElasticService {
  constructor(private readonly elasticService: ElasticsearchService) {}

  async createIndex(index: string) {
    await this.elasticService.indices.create({ index });
  }

  async bulkInsert(index: string, documents: Document[]) {
    const processedDocuments = documents.flatMap((doc) => [{ index: { _index: index } }, doc]);
    await this.elasticService.bulk({ body: processedDocuments });
  }

  async insert(index: string, document: Document) {
    await this.elasticService.index({ index, document });
  }

  async search(index: string, text: string) {
    const response = await this.elasticService.search({
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
