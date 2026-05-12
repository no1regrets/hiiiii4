import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsInt()
  @IsNotEmpty()
  telegramId!: number;
  
    
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsNotEmpty()
  firstName?: string;
}