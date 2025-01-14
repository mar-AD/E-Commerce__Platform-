import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admins')
export class AdminsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({unique: true, nullable: false})
  adminId: string;

  @Column({nullable: true})
  profilePic?: string;

  @Column({nullable: true})
  fullName?: string;
}