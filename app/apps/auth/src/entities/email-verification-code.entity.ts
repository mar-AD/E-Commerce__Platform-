import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AdminEntity } from '../admins/entities/admin.entity';
import { UserEntity } from '../users/entities/user.entity';

@Entity('email_verification_codes')
export class EmailVerificationCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(()=> AdminEntity, {nullable:true, onDelete: 'CASCADE'})
  @JoinColumn({ name: 'admin_id' })
  admin: AdminEntity;

  @ManyToOne(()=> UserEntity, {nullable:true, onDelete: 'CASCADE'})
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  code: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({type: 'timestamp'})
  expiresAt: Date;
}