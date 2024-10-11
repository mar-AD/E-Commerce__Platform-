import { Injectable } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';

@Injectable()
export class CronService {
  constructor() {
  }

  async CleanUpJob(entityRepository: Repository<any>, monthsOld: number){
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() -  monthsOld);

    const entitiesToDelete = await entityRepository.find({where: {isDeleted: true, deletedAt: LessThan(currentDate)}});

    if (entitiesToDelete.length > 0) {
      await entityRepository.remove(entitiesToDelete);
      entitiesToDelete.map((entity)=> {
        console.log(`${entity.id} older than ${monthsOld} months hard-deleted`);
      })
      console.log(`Entities older than ${monthsOld} months hard-deleted`);
    }else {
      console.log(`No entities older than ${monthsOld} months found for deletion.`);
    }
  }

}