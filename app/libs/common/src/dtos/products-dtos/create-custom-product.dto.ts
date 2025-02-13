import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsString, IsUUID } from 'class-validator';
import { Placement } from '@app/common';


export class CreateCustomProductDto {
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
    example: {
      front: { x: 50, y: 120, width: 200, height: 150, rotation: 15, scale: 1.2 },
      back: { x: 10, y: 200, width: 100, height: 80, rotation: 15, scale: 1.2 }
    }
  })
  @IsNotEmpty()
  @IsObject()
  placement: Placement;

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
  totalPrice: number;
}
