import { Controller, Get, Req } from '@nestjs/common';
import { OutlookService } from './outlook.service';

@Controller('outlook')
export class OutlookController {
  constructor(private outlookService: OutlookService) {}

  @Get('callback')
  async handleOutlookCallback(@Req() req) {
    const response = await this.outlookService.handleCallback(req?.query?.code);
    return response;
  }

  @Get('handleChangeNotification')
  async handleChangeNotification() {
    const response = await this.outlookService.handleChangeNotification();
    return response;
  }
}
