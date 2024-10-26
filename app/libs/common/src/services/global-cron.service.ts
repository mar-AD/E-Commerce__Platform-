import { Injectable } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { LoggerService } from '@app/common/services/logger.service';

@Injectable()
export class CronService {
  constructor(
    private readonly logger: LoggerService,
  ) {
  }

  async CleanUpJob(entityRepository: Repository<any>, monthsOld: number){
    this.logger.log(`Starting cleanup for entities older than ${monthsOld} months.`);
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() -  monthsOld);

    const entitiesToDelete = await entityRepository.find({where: {isDeleted: true, deletedAt: LessThan(currentDate)}});

    if (entitiesToDelete.length > 0) {
      await entityRepository.remove(entitiesToDelete);
      entitiesToDelete.map((entity)=> {
        this.logger.log(`${entity.id} older than ${monthsOld} months hard-deleted`);
      })
      this.logger.log(`Entities older than ${monthsOld} months hard-deleted`);
    }else {
      this.logger.log(`No entities older than ${monthsOld} months found for deletion.`);
    }
  }

}