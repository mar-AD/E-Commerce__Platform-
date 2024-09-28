import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { AdminEntity } from '../admins/entities/admin.entity';

@Entity('refreshToken')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => AdminEntity, { nullable: true })
  @JoinColumn({ name: 'admin_id' })
  admin: AdminEntity;

  @Column({default: false})
  revoked: boolean
}
