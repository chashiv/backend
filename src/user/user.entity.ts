import { Injectable } from '@nestjs/common';
import { ElasticService } from 'src/elastic/elastic.service';
import { USER_INDEX } from './user.enum';
import { IUser, UserFieldsEnum } from './user.interface';
import { v4 as uuidv4 } from 'uuid';
import { Document } from 'src/elastic/elastic.interface';

@Injectable()
export class UserEntity {
  private readonly userIndex: string;

  constructor(private elasticsearchSerivce: ElasticService) {
    this.userIndex = USER_INDEX;
  }

  getUserByEmail = async (email: string) => {
    const userDetails = await this.elasticsearchSerivce.exactSearch(
      this.userIndex,
      `${UserFieldsEnum.email}`,
      email,
    );
    if (userDetails && userDetails.length) return userDetails[0]?._source;
  };

  async saveUser(userDetails: IUser) {
    const userDetailsWithoutUserId = { ...userDetails };
    delete userDetailsWithoutUserId.userId;
    await this.elasticsearchSerivce.update(
      this.userIndex,
      userDetails.id,
      userDetails as unknown as Document,
      userDetailsWithoutUserId as unknown as Document,
    );
  }

  deleteUser = async (id: uuidv4) => {
    await this.elasticsearchSerivce.delete(this.userIndex, id);
  };
}
