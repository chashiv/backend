import { Injectable } from '@nestjs/common';
import { Document } from './elastic.interface';
import * as elasticsearch from 'elasticsearch';
import { ConfigService } from '@nestjs/config';
import { Uuid } from '@elastic/elasticsearch/lib/api/types';
import axios from 'axios';
import { IUser } from 'src/user/user.interface';

@Injectable()
export class ElasticService {
  private readonly esclient: elasticsearch.Client;
  private readonly elasticSearchUrl: string;

  constructor(private configService: ConfigService) {
    this.elasticSearchUrl = this.configService.getOrThrow<string>('ELASTIC_SEARCH_URL');
    this.esclient = new elasticsearch.Client({ host: this.elasticSearchUrl });
  }

  async createIndex(index: string) {
    await this.esclient.indices.create({ index });
  }

  async bulkInsert(index: string, documents: Document[]) {
    const processedDocuments = documents.flatMap((doc) => [{ index: { _index: index } }, doc]);
    await this.esclient.bulk({ body: processedDocuments });
  }

  async insert(index: string, document: IUser, id: Uuid) {
    await axios.put(`${this.elasticSearchUrl}/${index}/_create/${id}`, document, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async delete(index: string, id: Uuid) {
    await axios.delete(`${this.elasticSearchUrl}/${index}/_doc/${id}`);
  }

  async search(index: string, query: string, fields: string[] = []) {
    const response = await this.esclient.search({
      index,
      body: {
        query: {
          multi_match: {
            query,
            fields: fields.length ? fields : ['_all'],
          },
        },
      },
    });
    return response.hits.hits;
  }

  async exactSearch(index: string, field: string, value: string) {
    const response = await this.esclient.search({
      index,
      body: {
        query: {
          term: {
            [field]: value,
          },
        },
      },
    });
    return response.hits.hits;
  }

  async searchByFields(index: string, queries: { [field: string]: string }) {
    const mustQueries = Object.entries(queries).map(([field, value]) => ({
      match: { [field]: value },
    }));
    const response = await this.esclient.search({
      index,
      body: {
        query: {
          bool: {
            must: mustQueries,
          },
        },
      },
    });
    return response.hits.hits;
  }

  async paginatedSearch(index: string, query: string, from: number = 0, size: number = 10) {
    const response = await this.esclient.search({
      index,
      body: {
        from,
        size,
        query: {
          multi_match: {
            query,
            fields: ['_all'],
          },
        },
      },
    });
    return response.hits.hits;
  }

  async update(index: string, id: Uuid, upsertDocument: Document, document: Document) {
    await axios.post(
      `${this.elasticSearchUrl}/${index}/_update/${id}`,
      {
        doc: document,
        upsert: upsertDocument,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
