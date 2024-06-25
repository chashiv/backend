import * as Joi from 'joi';
import { ProviderEnum } from 'src/auth/auth.enum';

export const getMailFoldersValidations = Joi.object({
  provider: Joi.string()
    .valid(...Object.values(ProviderEnum))
    .required(),
  email: Joi.string().trim().email().required(),
});
