import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    required: true,
    description: 'Product name is required',
    example: 'Custom T-Shirt',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    description: 'Product description',
    example: 'A high-quality cotton t-shirt',
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    required: true,
    description: 'Product price',
    example: 19.99,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    required: true,
    description: 'Product Image URL',
    example: ['image1.png', 'image2.png'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  // @IsUrl()
  image: string[];

  @ApiProperty({
    required: true,
    description: 'Product template URL',
    example: ['template1.png', 'template2.png'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  // @IsUrl()
  template: string[];
}
