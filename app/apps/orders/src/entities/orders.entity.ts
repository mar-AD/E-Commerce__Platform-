import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';

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

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
