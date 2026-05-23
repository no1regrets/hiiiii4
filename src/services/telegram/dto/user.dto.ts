import { IsString, IsInt, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { isBigInt64Array } from 'node:util/types';

export class UserDto {
  @IsNumber()
  @IsNotEmpty()
  telegramId!: number;
  
    
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsNumber()
  @IsOptional()
  refId?: number;
}