import { NodeEnv } from '@core/enums';

export interface IAppConfig {
  readonly nodeEnv: NodeEnv;
  readonly port: number;
}
