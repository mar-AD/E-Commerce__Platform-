import { Test, TestingModule } from '@nestjs/testing';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';

describe('AdminsController', () => {
  let adminsController: AdminsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AdminsController],
      providers: [AdminsService],
    }).compile();

    adminsController = app.get<AdminsController>(AdminsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(adminsController.getHello()).toBe('Hello World!');
    });
  });
});
