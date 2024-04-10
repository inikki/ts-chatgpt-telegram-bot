import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum LogLevelEnum {
  info = 'info',
  debug = 'debug',
  error = 'error',
}

export class EnvironmentVarsDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(LogLevelEnum)
  LOG_LEVEL!: LogLevelEnum;

  @IsNotEmpty()
  @IsString()
  PORT!: string;

  @IsNotEmpty()
  @IsString()
  OPEN_AI_KEY!: string;

  @IsNotEmpty()
  @IsString()
  TELEGRAM_BOT_TOKEN!: string;

  @IsNotEmpty()
  @IsString()
  REDIS_PORT!: string;

  @IsNotEmpty()
  @IsString()
  REDIS_HOST!: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  LONG_POLLING_FLAG!: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  TELEGRAM_WEBHOOK_SECRET_TOKEN!: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  SSL_URL!: string;
}
