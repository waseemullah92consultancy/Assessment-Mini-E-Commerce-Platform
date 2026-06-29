import {
  IsString,
  IsNumber,
  IsArray,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsPositive,
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { ProductCategory } from '../schemas/product.schema';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsNumber()
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsEnum(ProductCategory, { message: 'Category must be one of: Electronics, Clothing, Books, Home, Sports' })
  category: ProductCategory;

  @IsInt({ message: 'Stock quantity must be an integer' })
  @Min(0, { message: 'Stock quantity must be non-negative' })
  stockQuantity: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
