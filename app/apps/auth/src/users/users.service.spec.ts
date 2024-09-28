import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { lastValueFrom, of } from 'rxjs';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import * as configs from '@app/common'
import { messages } from '@app/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<UserEntity>
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository=module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('userRepository should be defined',() =>{
    expect(userRepository).toBeDefined()
  })

  describe('create', () =>{
    const createUserDto: CreateUserDto = {
      email: 'email@gmail.com',
      password: 'pass'
    }

    const mockUserEntity: UserEntity = {
      id: '1hg34',
      email: '43r34@gmail.com',
      password: 'pass',
      isActive: true,
      isEmailVerified: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }


    it ('should throw BadRequestException if user already exists', async()=>{
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUserEntity)
      // userRepository.findOne.mockReturnValue(of({email: 'email@gmail.com'}));
      await expect(lastValueFrom(service.create(createUserDto))).rejects.toThrow(
        new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          message: `User with email: ${createUserDto.email} already exists.`
        })
      )
    })
    it ('should hash pass and create a new user successfully', async()=>{
      // jest.spyOn(configs, 'hashPassword').mockReturnValue(of('hashedPassword123'))
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUserEntity);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUserEntity);

      const results = await lastValueFrom(service.create(createUserDto))

      // expect(configs.hashPassword).toHaveBeenCalledWith('pass');
      expect(results).toEqual(mockUserEntity);
      expect(userRepository.save).toHaveBeenCalledWith(mockUserEntity)
    })
    it('should throw BadRequestException if there is an error saving the user', async()=>{
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null)
      // jest.spyOn(configs, 'hashPassword').mockReturnValue(of('hashedPassword123'))
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUserEntity)
      jest.spyOn(userRepository, 'save').mockRejectedValue(new Error('Save failed'))


      await expect(lastValueFrom(service.create(createUserDto))).rejects.toThrow(
        new BadRequestException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: messages.USER.FAILED_TO_CREATE_USER
        })
      )

    })
  })
});
