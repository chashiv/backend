import * as Joi from 'joi';

export const listMailsValidation = Joi.object({
  email: Joi.string().email().required(),
});
