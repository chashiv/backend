import { Controller, Get, Query, Req, UsePipes } from '@nestjs/common';
import { OutlookService } from './outlook.service';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { listMailsValidation } from './outlook.validations';

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

  @Get('list-mails')
  @UsePipes(new JoiValidationPipe(listMailsValidation))
  async listMails(@Query() query) {
    const response = await this.outlookService.listMails(query.email);
    return response;
  }
}
