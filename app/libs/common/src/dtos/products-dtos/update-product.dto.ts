import { IsBoolean, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({
    required: false,
    description: 'Product name is required',
    example: 'Custom T-Shirt',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    required: false,
    description: 'Product description',
    example: 'A high-quality cotton t-shirt',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    required: false,
    description: 'Product price',
    example: 19.99,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    required: false,
    description: 'Product Image URL',
    example: 'imagesProduct.png',
  })
  @IsOptional()
  @IsString()
    // @IsUrl()
  image?: string;

  @ApiProperty({
    required: false,
    description: 'Product template URL',
    example: 'product-template.png',
  })
  @IsOptional()
  @IsString()
    // @IsUrl()
  template?: string;

  @ApiProperty({
    required: false,
    description: 'Is the product active or not',
    example: 'true/false',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}