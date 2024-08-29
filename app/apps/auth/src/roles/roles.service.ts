import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Observable, of } from 'rxjs';
import { ResponseDto } from '@app/common/types/response.dto';
import { Role } from '@app/common';

@Injectable()
export class RolesService {
  create(createRoleDto: CreateRoleDto): Observable<ResponseDto<Role>> {
    console.log('This action adds a new role');
    const response = new ResponseDto(this.mapRoleResponse(createRoleDto), HttpStatus.CREATED, 'This action adds a new role');
    return of(response)
  }

  findAll() {
    console.log(`This action returns all roles`);
    return ;
  }

  findOne(id: string) {
    return `This action returns a #${id} role`;
  }

  update(id: string, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: string) {
    return `This action removes a #${id} role`;
  }

  //we need this so we can follow the schema keys
  mapRoleResponse(role:Role): Role {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }
  }
}

}
