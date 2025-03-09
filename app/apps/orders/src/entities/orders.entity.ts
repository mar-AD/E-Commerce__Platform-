import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { getDeliveryDate, getDeliveryType } from '@app/common/utils/configs';
import { DeliveryType, OrderStatus, ProductItem } from '@app/common/types/orders';



@Entity()
export class OrdersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column('jsonb')
  products: ProductItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column( {type:'timestamp', default: getDeliveryDate(getDeliveryType(DeliveryType.STANDARD))})
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
