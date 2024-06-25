import { Body, Controller, Get, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { authControllerValidations } from './auth.validations';
import { IProvider } from 'src/providers/provider.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('')
  @UsePipes(new JoiValidationPipe(authControllerValidations))
  async authenticate(@Body() payload: IProvider) {
    const response = await this.authService.authenticate(payload);
    return response;
  }
}
