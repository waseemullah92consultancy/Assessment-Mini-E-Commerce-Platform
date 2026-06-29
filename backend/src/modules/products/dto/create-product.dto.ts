import {
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { ProductCategory } from '../schemas/product.schema';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
