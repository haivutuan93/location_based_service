import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Place } from './Place';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string; 

  @Column()
  password!: string;

  @ManyToMany(() => Place, { cascade: true })
  @JoinTable({
    name: 'user_favorites_place', 
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'placeId',
      referencedColumnName: 'id',
    },
  })
  favorites!: Place[];
}
