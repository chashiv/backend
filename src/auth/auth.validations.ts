import * as Joi from 'joi';
import { ProviderEnum } from './auth.enum';

export const authControllerValidations = Joi.object({
  provider: Joi.string()
    .valid(...Object.values(ProviderEnum))
    .required(),
});
