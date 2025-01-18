import { HttpStatus, Injectable } from '@nestjs/common';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
import {
  dateToTimestamp, Empty, FindOneDto, getPermissionName,
  LoggerService,
  messages, Permissions,
  Role,
  RolesResponse,
} from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CreateRoleDto, UpdateRoleDto } from '@app/common/dtos/auth-dtos';
import { arraysEqual, findDuplicates } from '../constants';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly logger: LoggerService
  ) {
  }

  create(createRoleDto: CreateRoleDto): Observable<Role> {
    const {name, permissions} = createRoleDto;
    this.logger.log('roleRepo: Searching for role in repository...');
    return from(this.roleRepository.findOne({where: {name: name}})).pipe(
      switchMap((thisRole)=>{
        if (thisRole){
          this.logger.error(`roleRepo: Role with name "${name}" already exists.`)

          throw new RpcException({
            code: status.ALREADY_EXISTS,
            message: 'Role with this name already exist'
          })
        }

        const duplicatedPermissions = findDuplicates(permissions)

        if (duplicatedPermissions.length > 0) {
          throw new RpcException({
            code: status.ALREADY_EXISTS,
            message: `Role with permission(s) "${duplicatedPermissions.map(per => getPermissionName(per as Permissions )).join(', ')}" already exists.`,
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
            throw new RpcException({
              code: status.INTERNAL,
              message: messages.ROLE.FAILED_TO_CREATE_ROLE,
            });
          })
        )
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
        throw new RpcException({
          code: status.INTERNAL,
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
          throw new RpcException ({
            code: status.NOT_FOUND,
            message: messages.ROLE.NOT_FOUND
          })
        }
        this.logger.log('roleRepo: Role found successfully')
        return this.mapRoleResponse(thisRole)
      }),
      catchError((err)=>{
        this.logger.error(`roleRepo: ${messages.ROLE.FAILED_TO_FETCH_ROLE}: ${err.message}`);
        throw new RpcException({
          code: status.INTERNAL,
          message: messages.ROLE.FAILED_TO_FETCH_ROLE,
        });
      })
    )
  }

  update(updateRoleDto: UpdateRoleDto, findOneDto: FindOneDto): Observable<Role> {
    const { id } = findOneDto;
    this.logger.log('roleRepo: Searching for the role in repository...');
    return from(this.roleRepository.findOne({where: {id: id}})).pipe(
      switchMap((thisRole)=>{
        if (!thisRole){
          this.logger.error(`roleRepo: No role with id "${id}" found.`);
          throw new RpcException ({
            code: status.NOT_FOUND,
            message: messages.ROLE.FAILED_TO_FETCH_ROLE_FOR_UPDATE
          })
        }
        const duplicatedPermissions = findDuplicates(updateRoleDto.permissions);
        if (duplicatedPermissions.length > 0) {
          throw new RpcException({
            code: status.ALREADY_EXISTS,
            message: `Role with permission(s) "${duplicatedPermissions.map(per => getPermissionName(per as Permissions )).join(', ')}" already exists.`,
          });
        }

        if (updateRoleDto.name && updateRoleDto.name !== thisRole.name) {
          thisRole.name = updateRoleDto.name;
        }

        console.log('we are bout to compare');
        if (updateRoleDto.permissions && !arraysEqual(updateRoleDto.permissions, thisRole.permissions)) {
          console.log('the compare is happening');
          thisRole.permissions = updateRoleDto.permissions;
        }
        console.log('compare is done');
        this.logger.log('roleRepo: Saving the updated entity to the repository...')
        return from(this.roleRepository.save(thisRole)).pipe(
          map((updatedRole)=>{
            this.logger.log('roleRepo: Role updated successfully')
            return this.mapRoleResponse(updatedRole)
          }),
          catchError((err)=>{
            this.logger.error(`roleRepo: ${messages.ROLE.FAILED_TO_UPDATE_ROLE}: ${err.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: messages.ROLE.FAILED_TO_UPDATE_ROLE,
            });
          })
        )
      })
    )
  }

  remove(findOneDto: FindOneDto): Observable<Empty> {
    this.logger.log('roleRepo: Searching for the role in repository to remove...');

    return from(this.roleRepository.findOne({ where: { id: findOneDto.id } })).pipe(
      switchMap((thisRole) => {
        if (!thisRole) {
          this.logger.error(`roleRepo: No role with id "${findOneDto.id}" found.`);
          throw new RpcException({
            code: status.NOT_FOUND,
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
            throw new RpcException({
              code: status.INTERNAL,
              message: messages.ROLE.FAILED_REMOVE_ROLE,
            });
          })
        );
      })
    );
  }


  //map RoleEntity to the role schema for consistency with the expected response format
  mapRoleResponse(role:RoleEntity): Role {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions.map(perm => getPermissionName(perm as Permissions )),
      createdAt: dateToTimestamp(role.createdAt),
      updatedAt: dateToTimestamp(role.updatedAt),
    }
  }


}
