import { Test, TestingModule } from '@nestjs/testing';
import { AdminsService } from './admins.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminEntity } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { CreateAdminDto, Permissions } from '@app/common';
import { RoleEntity } from '../roles/entities/role.entity';

describe('AdminsService', () => {
  let service: AdminsService;
  let adminRepository: Repository<AdminEntity>;
  let roleRepository: Repository<RoleEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminsService, {
        provide: getRepositoryToken(AdminEntity),
        useValue: {
          findOne: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
        }
        },
        { provide: getRepositoryToken(RoleEntity),
          useValue: {
          findOne: jest.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<AdminsService>(AdminsService);
    adminRepository = module.get<Repository<AdminEntity>>(getRepositoryToken(AdminEntity));
    roleRepository = module.get<Repository<RoleEntity>>(getRepositoryToken(RoleEntity))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it ('expects admin repository to be defined', () => {
    expect(adminRepository).toBeDefined();
  })

  describe('create', () =>{
      const createAdminDto: CreateAdminDto = {
        email:'admin@gmail.com',
        password:'123456',
        role: 'admin',
      }

      const mockAdminEntity: AdminEntity = {
        id: '1hg34',
        roleId: '123',
        email: '43r34@gmail.com',
        password: 'pass',
        isActive: true,
        isEmailVerified: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

    const mockRoleEntity: RoleEntity = {
      id: '1h75g34',
      name: 'false',
      permissions: [Permissions.MANAGE_ROLES, Permissions.MANAGE_ORDERS],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  })
});
