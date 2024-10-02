import {
  Column,
  CreateDateColumn, DeleteDateColumn,
  Entity, JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleEntity } from '../../roles/entities/role.entity';

@Entity('admin')
export class AdminEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'role_id' })
  roleId: RoleEntity;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
