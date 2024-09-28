import { Module } from '@nestjs/common';
import { CommonService } from '@app/common/services/common.service';
import { JwtTokenService } from '@app/common/services/jwtoken.service';


@Module({
  providers: [CommonService, JwtTokenService],
  exports: [CommonService, JwtTokenService],
})
export class CommonModule {}
