import { Body, Controller, Get, Res, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { authControllerValidations } from './auth.validations';
import { IAuthenticate } from './auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('')
  @UsePipes(new JoiValidationPipe(authControllerValidations))
  async authenticate(@Body() payload: IAuthenticate, @Res() res) {
    try {
      const response = await this.authService.authenticate(payload);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
