import { IsString, IsInt, IsOptional, IsNotEmpty, IsNumber } from 'class-validator';
import { isBigInt64Array } from 'node:util/types';

export class PostDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    description!: string;

    @IsNotEmpty()
    @IsNumber()
    price!: number;

    @IsNotEmpty()
    @IsString()
    data!: string; // JSON string with additional data
}