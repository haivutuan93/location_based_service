import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import { Place } from '../models/Place';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private placeRepository = AppDataSource.getRepository(Place);

  async getFavorites(userId: number): Promise<any[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const favoriteRelations = await AppDataSource.manager.query(
      'SELECT `placeId` FROM `user_favorites_place` WHERE `userId` = ?',
      [userId]
    );

    if (!favoriteRelations || favoriteRelations.length === 0) {
      return [];
    }

    const favoriteIds = favoriteRelations.map((p: any) => p.placeId);

    const places = await this.placeRepository.createQueryBuilder('place')
      .whereInIds(favoriteIds)
      .select('place.id', 'id')
      .addSelect('place.name', 'name')
      .addSelect('place.type', 'type')
      .addSelect('ST_AsText(place.location)', 'location')
      .getRawMany();

    return places.map(p => {
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
  }

  async addFavorite(userId: number, placeId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    const placeExists = await this.placeRepository
      .createQueryBuilder()
      .select('1')
      .where('id = :placeId', { placeId })
      .getRawOne();

    if (!placeExists) {
      throw new Error('Place not found');
    }

    const favoriteExists = await AppDataSource.manager.query(
      'SELECT 1 FROM `user_favorites_place` WHERE `userId` = ? AND `placeId` = ?',
      [userId, placeId]
    );

    if (favoriteExists.length > 0) {
      return false;
    }

    await AppDataSource.createQueryBuilder()
      .relation(User, 'favorites')
      .of(user)
      .add(placeId);

    return true;
  }

  async removeFavorite(userId: number, placeId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const placeExists = await this.placeRepository
      .createQueryBuilder()
      .select('1')
      .where('id = :placeId', { placeId })
      .getRawOne();

    if (!placeExists) {
      throw new Error('Place not found');
    }

    const favoriteExists = await AppDataSource.manager.query(
      'SELECT 1 FROM `user_favorites_place` WHERE `userId` = ? AND `placeId` = ?',
      [userId, placeId]
    );

    if (favoriteExists.length === 0) {
      throw new Error('Favorite not found');
    }

    await AppDataSource.createQueryBuilder()
      .relation(User, 'favorites')
      .of(user)
      .remove(placeId);

    user.favorites = (await this.getFavorites(userId)) as Place[];
    return user;
  }
}
