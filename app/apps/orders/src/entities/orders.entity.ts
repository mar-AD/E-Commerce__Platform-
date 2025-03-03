import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { DeliveryType, getDeliveryDate, getDeliveryType, OrderStatus, ProductItem } from '@app/common';

@Entity()
export class OrdersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column('jsonb')
  products: ProductItem[];

  @Column()
  totalPrice: number;

  @Column( {default: getDeliveryDate(getDeliveryType(DeliveryType.STANDARD))})
  deliveryDate: Date;

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
