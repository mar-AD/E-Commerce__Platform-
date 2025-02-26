import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryType } from '@app/common';

class OrderProductDto {
  @ApiProperty()
  @IsUUID()
  customProductId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'List of products included in the order',
    example: [
      {
        productId: '123456',
        quantity: 2
      },
      {
        productId: '789012',
        quantity: 1
      }
    ]
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({each: true})
  @Type(()=> OrderProductDto)
  products: OrderProductDto[];

  @ApiProperty({
    description: 'Total price of the order in currency units',
    example: 99.99
  })
  @IsNotEmpty()
  @IsNumber({}, { message: 'Total price must be a number' })
  @Min(0, { message: 'Total price cannot be negative' })
  totalPrice: number

  @ApiProperty({example: DeliveryType.EXPRESS})
  @IsNotEmpty()
  deliveryDate: DeliveryType
}