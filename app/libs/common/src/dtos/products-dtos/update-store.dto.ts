import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateStoreDto {
  @ApiProperty({
    required: false,
    description: 'Store name',
    example: 'D-Store',
  })
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiProperty({
    required: false,
    description: 'Store description',
    example: 'D-Store is the best store on this platform',
  })
  @IsOptional()
  @IsString()
  storeDescription?: string;

  @ApiProperty({
    required: false,
    description: 'Store profile picture URL',
    example: 'https://example.com/store-pic.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  storePic?: string;

  @ApiProperty({
    required: false,
    description: 'Store banner image URL',
    example: 'https://example.com/store-banner.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  storeBanner?: string;

  @ApiProperty({
    required: false,
    description: 'Activate or deactivate store',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}