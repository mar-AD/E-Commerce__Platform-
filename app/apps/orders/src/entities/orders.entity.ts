import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { OrderStatus } from '@app/common';

@Entity()
export class OrdersEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @Column('jsonb')
  products: { customProductId: string; quantity: number }[];

  @Column()
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
