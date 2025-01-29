import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateCustomProductDto {
  @ApiProperty({
    required: true,
    description: 'Custom product ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({
    required: true,
    description: 'User ID',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    required: true,
    description: 'Design details',
    example: 'Floral print',
  })
  @IsNotEmpty()
  @IsString()
  design: string;

  @ApiProperty({
    required: true,
    description: 'Placement of the design',
    example: 'Front',
  })
  @IsNotEmpty()
  @IsString()
  placement: string;

  @ApiProperty({
    required: true,
    description: 'Color of the custom product',
    example: 'Black',
  })
  @IsNotEmpty()
  @IsString()
  color: string;

  @ApiProperty({
    required: true,
    description: 'Size of the custom product',
    example: 'L',
  })
  @IsNotEmpty()
  @IsString()
  size: string;

  @ApiProperty({
    required: true,
    description: 'Total price of the custom product',
    example: 99.99,
  })
  @IsNotEmpty()
  @IsNumber()
  totalPrice: number; // Changed from string to number
}
