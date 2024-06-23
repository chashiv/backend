import { Injectable } from '@nestjs/common';
import { Document } from './elastic.interface';
import * as elasticsearch from 'elasticsearch';
import { ConfigService } from '@nestjs/config';
import { Uuid } from '@elastic/elasticsearch/lib/api/types';
import axios from 'axios';

@Injectable()
export class ElasticService {
  private readonly esclient: elasticsearch.Client;
  private readonly elasticSearchUrl: string;

  constructor(private configService: ConfigService) {
    this.elasticSearchUrl = this.configService.getOrThrow<string>('ELASTIC_SEARCH_URL');
    this.esclient = new elasticsearch.Client({
      host: this.elasticSearchUrl,
    });
  }

  async createIndex(index: string) {
    await this.esclient.indices.create({ index });
  }

  async bulkInsert(index: string, documents: Document[]) {
    const processedDocuments = documents.flatMap((doc) => [{ index: { _index: index } }, doc]);
    await this.esclient.bulk({ body: processedDocuments });
  }

  async insert(index: string, document: Document, id: Uuid) {
    await axios.put(
      `${this.elasticSearchUrl}/${index}/_create/${id}`,
      {
        ...document,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  async delete(index: string, id: Uuid) {
    try {
      console.log(index, id);
      const response = await axios.delete(`${this.elasticSearchUrl}/${index}/_doc/${id}`);
      console.log(response);
    } catch (error) {}
  }

  async search(index: string, text: string) {
    const response = await this.esclient.search({
      index,
      body: {
        query: {
          bool: {
            should: [{ term: { userPrincipalName: text } }, { term: { mail: text } }],
          },
        },
      },
    });
    return response?.hits?.hits;
  }
}
