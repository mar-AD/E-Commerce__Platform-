import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { AdminEntity } from '../admins/entities/admin.entity';
import { IsOptional } from 'class-validator';

@Entity('refreshToken')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column({type: 'timestamp'})
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @IsOptional()
  user: UserEntity;

  @ManyToOne(() => AdminEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  @IsOptional()
  admin: AdminEntity;

  @Column({default: false})
  revoked: boolean
}
