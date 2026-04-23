import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsIn,
  IsNumber,
  Min,
  Max,
  IsInt,
} from 'class-validator';

export class GetProfilesDto {
  // --- Filters ---

  @IsOptional()
  @IsIn(['male', 'female'], { message: 'gender must be either "male" or "female"' })
  gender?: string;

  @IsOptional()
  @IsIn(['child', 'teenager', 'young', 'adult', 'senior'], {
    message: 'age_group must be one of: child, teenager, young, adult, senior',
  })
  age_group?: string;

  @IsOptional()
  @IsString()
  country_id?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(150)
  min_age?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(150)
  max_age?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(1)
  min_gender_probability?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(1)
  max_gender_probability?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(1)
  min_country_probability?: number;

  // --- Sorting ---

  @IsOptional()
  @IsIn(['age', 'created_at', 'name', 'gender_probability'], {
    message: 'sort_by must be one of: age, created_at, name, gender_probability',
  })
  sort_by?: 'age' | 'created_at' | 'name' | 'gender_probability' = 'created_at';

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'order must be either "asc" or "desc"' })
  order?: 'asc' | 'desc' = 'asc';

  // --- Pagination ---

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
