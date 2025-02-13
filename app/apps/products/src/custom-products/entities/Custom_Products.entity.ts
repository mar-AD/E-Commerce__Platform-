import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductEntity } from '../../core-products/entities/products.entity';
import { Placement } from '@app/common';

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

  @Column({ type: 'jsonb', nullable: false })
  placement: Placement;

  @Column({ type: 'varchar', nullable: false })
  color: string;

  @Column({ type: 'varchar', nullable: false })
  size: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalPrice: number;

  @Column({type: 'boolean',default: false})
  isPublished: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
