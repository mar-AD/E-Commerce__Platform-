import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Categories' )
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;
}