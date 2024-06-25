import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class UtilService {
  constructor() {}

  shortenString(input: string): string {
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return `${hash.substring(0, 8)}`;
  }
}
