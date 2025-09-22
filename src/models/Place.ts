import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { Point } from 'geojson';

@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  type!: string;

  @Index({ spatial: true })
  @Column({
    type: 'point',
    spatialFeatureType: 'Point',
    srid: 4326, // WGS 84, a standard for GPS
  })
  location!: Point;
}
