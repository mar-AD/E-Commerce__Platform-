import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
import {
  CreateRoleDto,
  dateToTimestamp, Empty,
  FindOneDto,
  LoggerService,
  messages,
  Role,
  RolesResponse,
  UpdateRoleDto,
} from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly logger: LoggerService
  ) {
  }

  create(createRoleDto: CreateRoleDto): Observable<Role> {
    const {name} = createRoleDto;
    this.logger.log('roleRepo: Searching for role in repository...');
    return from(this.roleRepository.findOne({where: {name: name}})).pipe(
      switchMap((thisRole)=>{
        if (thisRole){
          this.logger.error(`roleRepo: Role with name "${name}" already exists.`)

          throw new BadRequestException({
            status: HttpStatus.BAD_REQUEST,
            message: 'Role with this name already exist'
          })
        }
        this.logger.log('roleRepo: No existing role found, proceeding to create Entity...')
        const newRole = this.roleRepository.create(createRoleDto)
        this.logger.log('roleRepo: Saving the new entity to the repository...')
        return from(this.roleRepository.save(newRole)).pipe(
          map((savedRole)=>{
            this.logger.log(`roleRepo: Entity successfully created with name "${name}".`);
            return this.mapRoleResponse(savedRole)
          }),
          catchError((err) => {
            this.logger.error(`roleRepo: Failed to create and save the entity with name "${name}". Error: ${err.message}`);
            throw new InternalServerErrorException({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: messages.ROLE.FAILED_TO_CREATE_ROLE,
            });
          })
        )
      }),
      catchError((err) => {
        this.logger.error(`roleRepo: Failed to process role creation. Error: ${err.message}`);
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: messages.ROLE.FAILED_TO_CREATE_ROLE,
        });
      }),
    )
  }

  findAll():Observable<RolesResponse> {
    this.logger.log('roleRepo: Searching for roles in repository...');
    return from(this.roleRepository.find()).pipe(
      map((roles) => {
        this.logger.log(`roleRepo: ${messages.ROLE.FETCH_ALL_ROLES}`)
        return {
          roles: roles.map(role => this.mapRoleResponse(role)),
          result: {
            status: HttpStatus.OK,
            message: messages.ROLE.FETCH_ALL_ROLES,
          }
        }
      }),
      catchError((err)=>{
        this.logger.error(`roleRepo: ${messages.ROLE.FAILED_FETCH_ROLES}: ${err.message}`);
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: messages.ROLE.FAILED_FETCH_ROLES,
        });
      })
    )
  }

  findOne(findOneDto: FindOneDto): Observable<Role> {
    const { id } = findOneDto;
    this.logger.log('roleRepo: Searching for the role in repository...');
    return from(this.roleRepository.findOne({where: {id}})).pipe(
      map((thisRole) => {
        if (!thisRole){
          this.logger.error(`roleRepo: No role with id "${id}" found.`);
          throw new NotFoundException ({
            status: HttpStatus.NOT_FOUND,
            message: messages.ROLE.NOT_FOUND
          })
        }
        this.logger.log('roleRepo: Role found successfully')
        return this.mapRoleResponse(thisRole)
      }),
      catchError((err)=>{
        this.logger.error(`roleRepo: ${messages.ROLE.FAILED_TO_FETCH_ROLE}: ${err.message}`);
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: messages.ROLE.FAILED_TO_FETCH_ROLE,
        });
      })
    )
  }

  update(id: string, updateRoleDto: UpdateRoleDto): Observable<Role> {
    this.logger.log('roleRepo: Searching for the role in repository...');
    return from(this.roleRepository.findOne({where: {id}})).pipe(
      switchMap((thisRole)=>{
        if (!thisRole){
          this.logger.error(`roleRepo: No role with id "${id}" found.`);
          throw new NotFoundException ({
            status: HttpStatus.NOT_FOUND,
            message: messages.ROLE.FAILED_TO_FETCH_ROLE_FOR_UPDATE
          })
        }
        if (updateRoleDto.name && updateRoleDto.name!== thisRole.name) {
          thisRole.name = updateRoleDto.name;
        }
        if (updateRoleDto.permissions && updateRoleDto.permissions!== thisRole.permissions) {
          thisRole.permissions = updateRoleDto.permissions;
        }
        this.logger.log('roleRepo: Saving the updated entity to the repository...')
        return from(this.roleRepository.save(thisRole)).pipe(
          map((updatedRole)=>{
            this.logger.log('roleRepo: Role updated successfully')
            return this.mapRoleResponse(updatedRole)
          }),
          catchError((err)=>{
            this.logger.error(`roleRepo: ${messages.ROLE.FAILED_TO_UPDATE_ROLE}: ${err.message}`);
            throw new InternalServerErrorException({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: messages.ROLE.FAILED_TO_UPDATE_ROLE,
            });
          })
        )
      }),
      catchError((err)=>{
        this.logger.error(`roleRepo: ${messages.ROLE.FAILED_TO_UPDATE_ROLE}: ${err.message}`);
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: messages.ROLE.FAILED_TO_UPDATE_ROLE,
        });
      })
    )
  }

  remove(findOneDto: FindOneDto): Observable<Empty> {
    this.logger.log('roleRepo: Searching for the role in repository to remove...');

    return from(this.roleRepository.findOne({ where: { id: findOneDto.id } })).pipe(
      switchMap((thisRole) => {
        if (!thisRole) {
          this.logger.error(`roleRepo: No role with id "${findOneDto.id}" found.`);
          throw new NotFoundException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ROLE.FAILED_FETCH_ROLE_FOR_REMOVAL,
          });
        }

        this.logger.log(`roleRepo: Removing role with id "${findOneDto.id}"...`);
        return from(this.roleRepository.remove(thisRole)).pipe(
          map(() => {
            this.logger.log(`roleRepo: ${messages.ROLE.ROLE_REMOVED_SUCCESSFULLY}`);
            return {
              result: {
                status: HttpStatus.OK,
                message: messages.ROLE.ROLE_REMOVED_SUCCESSFULLY
              }
            }
          }),
          catchError((err) => {
            this.logger.error(`roleRepo: ${messages.ROLE.FAILED_REMOVE_ROLE}: ${err.message}`);
            throw new InternalServerErrorException({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: messages.ROLE.FAILED_REMOVE_ROLE,
            });
          })
        );
      }),
      catchError((err) => {
        this.logger.error(`roleRepo: ${messages.ROLE.FAILED_REMOVE_ROLE}: ${err.message}`);
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: messages.ROLE.FAILED_REMOVE_ROLE,
        });
      })
    );
  }


  //we need this so we can follow the schema keys
  mapRoleResponse(role:RoleEntity): Role {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions,
      createdAt: dateToTimestamp(role.createdAt),
      updatedAt: dateToTimestamp(role.updatedAt),
    }
  }


}
