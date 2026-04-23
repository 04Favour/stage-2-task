import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SearchQueryDto {
  @IsNotEmpty({ message: 'Query string "q" is required' })
  @IsString()
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(500, { message: 'Query string must not exceed 500 characters' })
  q!: string;
}
