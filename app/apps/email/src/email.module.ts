import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
