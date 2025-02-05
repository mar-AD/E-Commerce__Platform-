import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateStoreDto {
  @ApiProperty({
    required: false,
    description: 'store name',
    example: 'D-Store',
  })
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiProperty({
    required: false,
    description: 'store description',
    example: 'D-Store is the best store on this platform',
  })
  @IsOptional()
  @IsString()
  storeDescription?: string;

  @ApiProperty({
    required: false,
    description: 'active or disactive store',
    example: 'true',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}