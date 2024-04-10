import { plainToClass } from 'class-transformer';
import { EnvironmentVarsDto } from './config/environment-vars.dto';
import { validateSync } from 'class-validator';

export const validateEnv = (): EnvironmentVarsDto => {
  const env = plainToClass(EnvironmentVarsDto, process.env);
  const errors = validateSync(env);

  if (errors.length > 0) {
    throw new Error(`Invalid environment variables: ${errors.join(', ')}`);
  }

  return env;
};

const config: EnvironmentVarsDto = validateEnv();

export default config;
