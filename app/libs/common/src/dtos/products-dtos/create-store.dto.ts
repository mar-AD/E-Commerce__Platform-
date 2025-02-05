import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({
    required: true,
    description: 'store name',
    example: 'D-Store',
  })
  @IsNotEmpty()
  @IsString()
  storeName: string;

  @ApiProperty({
    required: true,
    description: 'store description',
    example: 'D-Store is the best ...',
  })
  @IsNotEmpty()
  @IsString()
  storeDescription: string;
}