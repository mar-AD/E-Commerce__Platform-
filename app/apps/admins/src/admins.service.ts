import { HttpStatus, Injectable } from '@nestjs/common';
import { RmqContext, RpcException } from '@nestjs/microservices';
import {
  BaseResponse,
  GetAllAdminProfilesResponse,
  GetAdminProfileRequest,
  GetAdminProfileResponse, LoggerService,
  messages,
} from '@app/common';
import { catchError, from, map, Observable } from 'rxjs';
import { status } from '@grpc/grpc-js';
import { UpdateAdminProfileDto } from '@app/common/dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminsEntity } from './entities/admins.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(AdminsEntity) private readonly adminsRepository: Repository<AdminsEntity>,
    private readonly logger: LoggerService
    ) {
  }
  async registerAdminProfile( data: {adminId: string}, context: RmqContext): Promise<void> {
    const {adminId}=data;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`creating admin profile corresponding to admin ${adminId}`);
      await this.adminsRepository.save({ adminId })
      this.logger.log(`admin profile created successfully with ${adminId}`);
      channel.ack(originalMessage);
    }
    catch (error) {
      this.logger.error(`Failed to create admin profile with ${adminId}: ${error}`);
      channel.nack(originalMessage, false, true);
      throw new RpcException('Admin creation failed');
    }
  }

  getAdminsProfile(request: GetAdminProfileRequest): Observable<GetAdminProfileResponse>{
    this.logger.log(`Getting admins profile with ${request.adminId}`);
    return from(this.adminsRepository.findOne({where: { adminId: request.adminId }})).pipe(
      map((thisAdmin)=>{
        if (!thisAdmin){
          this.logger.error(`admin profile with "${request.adminId}" not found`);
          throw new RpcException({
            status: status.NOT_FOUND,
            message: messages.ADMIN.NOT_FOUND2
          })
        }
        this.logger.log('admin profile fetched successfully');
        return this.mapAdminsProfileResponse(thisAdmin);
      }),
      catchError((error) => {
        this.logger.error(`error fetching admin profile "${request.adminId}". Error: ${error.message}`);
        throw new RpcException({
          status: status.INTERNAL,
          message: messages.ADMIN.FAILED_TO_FETCH
        })
      })
    )
  }

  getAllAdminsProfiles(): Observable<GetAllAdminProfilesResponse> {
    this.logger.log(`Getting all admins' profiles`);
    return from(this.adminsRepository.find()).pipe(
      map((admins) => {
        this.logger.log('All admins profiles fetched successfully');
        return { profiles: admins.map(admin => this.mapAdminsProfileResponse(admin)) };
      }),
      catchError((error) => {
        this.logger.error(`Error fetching all admins' profiles. Error: ${error.message}`);
        throw new RpcException({
          status: status.INTERNAL,
          message: messages.ADMIN.FAILED_FETCH,
        });
      })
    );
  }

  async updateAdminProfile( data:{id: string, request: UpdateAdminProfileDto }, context: RmqContext): Promise<BaseResponse> {
    this.logger.log('getting the admin profile by adminId')
    const {id, request} = data;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const thisAdmin = await this.adminsRepository.findOne({where: { adminId: id }});
      if (!thisAdmin){
        this.logger.log(`admin profile with ${id} not found`);
        throw new RpcException({
          status: status.NOT_FOUND,
          message: messages.ADMIN.NOT_FOUND2
        })
      }
      const updatedFields = {}
      for (const key of ['profilePic', 'firstName', 'lastName', 'phoneNumber', 'address']) {
        if (request[key] !== undefined && request[key] !== thisAdmin[key]) {
          updatedFields[key] = request[key];
        }
      }

      if (Object.keys(updatedFields).length > 0) {
        Object.assign(thisAdmin, updatedFields);
        await this.adminsRepository.save(thisAdmin)
        this.logger.log(`admin profile updated successfully with ${id}`);
      }else{
        this.logger.log(`No changes detected for admin profile with id: ${id}`);
        return {
          status: HttpStatus.OK,
          message: 'No changes detected for admin profile'
        }
      }
      channel.ack(originalMessage)
      return {
        status: HttpStatus.OK,
        message: messages.ADMIN.ADMIN_UPDATED_SUCCESSFULLY
      }
    }
    catch(error) {
      this.logger.error(`Failed to update admin profile with ${id}: ${error}`);
      channel.nack(originalMessage, false, true);
      throw new RpcException('Admin profile update failed');
    }

  }

  async removeAdminProfile(data: { id: string }, context: RmqContext): Promise<void> {
    const { id } = data;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const result = await this.adminsRepository.delete({ adminId: id });
      if (result.affected === 0) {
        throw new RpcException({
          status: status.NOT_FOUND,
          message: messages.ADMIN.NOT_FOUND2,
        });
      }
      this.logger.log(`Successfully deleted admin profile with adminId: ${id}`);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`Failed to delete admin profile with adminId: ${id}: ${error}`);
      channel.nack(originalMessage, false, true);
      throw new RpcException('Admin profile removal failed');
    }
  }


  mapAdminsProfileResponse (admins: AdminsEntity): GetAdminProfileResponse {
    return {
      profilePic: admins.profilePic,
      fullName: admins.fullName,
    }
  }
}
