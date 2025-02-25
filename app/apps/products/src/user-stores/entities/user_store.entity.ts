import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_stores')
export class UserStoreEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false, unique: true })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  storeName: string;

  @Column({ type: 'text', nullable: true })
  storeDescription: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  storePic: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  storeBanner: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
