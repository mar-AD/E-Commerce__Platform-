import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, StatusType } from '@app/common';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({example: StatusType.PENDING})
  @IsNotEmpty()
  @IsString()
  status?: OrderStatus;
}