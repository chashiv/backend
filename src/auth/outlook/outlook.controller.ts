import { Controller, Get, Req, Res } from '@nestjs/common';
import { OutlookService } from './outlook.service';

@Controller('outlook')
export class OutlookController {
  constructor(private outlookService: OutlookService) {}

  @Get('callback')
  async handleOutlookCallback(@Req() req, @Res() res) {
    try {
      const response = await this.outlookService.handleCallback(req);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  @Get('handleChangesNotification')
  async handleChangesNotification(@Req() req, @Res() res) {
    try {
      const response = await this.outlookService.handleChangesNotification();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
