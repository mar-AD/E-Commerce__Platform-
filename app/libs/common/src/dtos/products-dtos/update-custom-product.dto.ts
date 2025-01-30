import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsObject } from 'class-validator';

export class UpdateCustomProductDto {
  @ApiProperty({
    required: false,
    description: 'Updated design details of the custom product',
    example: 'New floral pattern with an updated logo',
  })
  @IsOptional()
  @IsString()
  design?: string;

  @ApiProperty({
    required: false,
    description: 'Updated placement of the design on the product',
    example: 'Back side',
  })
  @IsOptional()
  @IsObject()
  placement?: Record<string, string>;

  @ApiProperty({
    required: false,
    description: 'Updated color of the custom product',
    example: 'Blue',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({
    required: false,
    description: 'Updated size of the custom product',
    example: 'XL',
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({
    required: false,
    description: 'Updated total price of the custom product',
    example: 59.99,
  })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @ApiProperty({
    required: false,
    description: 'Whether the custom product is published',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
