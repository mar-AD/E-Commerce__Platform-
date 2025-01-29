import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty} from 'class-validator';
import { CreateDto } from '@app/common/dtos';

export class CreateAdminDto extends CreateDto{
  @ApiProperty({ description: 'the name of the role assigned to the admin', example: 'supperAdmin' } )
  @IsNotEmpty()
  role: string
}
