import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from './products.entity';

@Entity('custom_products')
export class CustomProductsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'varchar', nullable: false })
  design: string;

  @Column({ type: 'json', nullable: false })
  placement: Record<string, any>;

  @Column({type: 'boolean',default: false})
  isPublished: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
