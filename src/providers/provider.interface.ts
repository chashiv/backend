import { ProviderEnum } from 'src/auth/auth.enum';

export type IProvider = {
  provider: ProviderEnum;
};

export type IProviderWithEmail = IProvider & {
  email: string;
};
