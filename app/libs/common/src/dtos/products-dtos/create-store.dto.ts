import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({
    required: true,
    description: 'Store name',
    example: 'D-Store',
  })
  @IsNotEmpty()
  @IsString()
  storeName: string;

  @ApiProperty({
    required: true,
    description: 'Store description',
    example: 'D-Store is the best ...',
  })
  @IsNotEmpty()
  @IsString()
  storeDescription: string;

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
}
