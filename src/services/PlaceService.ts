import { AppDataSource } from '../config/data-source';
import { Place } from '../models/Place';

export class PlaceService {
  private placeRepository = AppDataSource.getRepository(Place);

  async search(
    latitude: number,
    longitude: number,
    radius: number,
    name?: string,
    type?: string,
    page: number = 1,
    size: number = 10
  ): Promise<{
    data: (Place & { distance: number })[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const originWkt = `POINT(${latitude} ${longitude})`;

    const baseQuery = this.placeRepository
      .createQueryBuilder('place')
      .where(
        `ST_Distance_Sphere(place.location, ST_GeomFromText(:origin, 4326)) <= :radius`
      )
      .setParameters({
        origin: originWkt,
        radius: radius * 1000, // convert km to meters
      });

    if (name) {
      baseQuery.andWhere('place.name LIKE :name', { name: `%${name}%` });
    }

    if (type) {
      baseQuery.andWhere('place.type = :type', { type });
    }

    const total = await baseQuery.getCount();
    
    if (total === 0) {
      return {
        data: [],
        total: 0,
        page,
        size,
        totalPages: 0,
      };
    }

    const paginatedRaw = await baseQuery
      .select('place.id', 'id')
      .addSelect(
        `ST_Distance_Sphere(place.location, ST_GeomFromText(:origin, 4326)) / 1000`,
        'distance'
      )
      // Order by distance: from nearest to farthest
      .orderBy('distance', 'ASC')
      .offset((page - 1) * size)
      .limit(size)
      .getRawMany();
    
    const ids = paginatedRaw.map(p => p.id);
    const distanceMap = new Map(
      paginatedRaw.map(p => [p.id, parseFloat(p.distance)])
    );

    if (ids.length === 0) {
      return {
        data: [],
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      };
    }

    const rawPlaces = await this.placeRepository
      .createQueryBuilder('place')
      .whereInIds(ids)
      .select('place.id', 'id')
      .addSelect('place.name', 'name')
      .addSelect('place.type', 'type')
      .addSelect('ST_AsText(place.location)', 'location')
      .getRawMany();

    const places: Place[] = rawPlaces.map(p => {
      const coords = p.location
        .replace('POINT(', '')
        .replace(')', '')
        .split(' ')
        .map(parseFloat);
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        location: {
          type: 'Point',
          coordinates: [coords[0], coords[1]],
        },
      };
    });

    places.sort((a, b) => distanceMap.get(a.id)! - distanceMap.get(b.id)!);

    const data = places.map(place => ({
      ...place,
      distance: Math.round(distanceMap.get(place.id)! * 100) / 100, // round to 2 decimal places
    }));

    return {
      data,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }
}

