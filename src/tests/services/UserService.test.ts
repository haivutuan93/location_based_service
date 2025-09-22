import { UserService } from '../../services/UserService';
import { AppDataSource } from '../../config/data-source';
import { User } from '../../models/User';
import { Place } from '../../models/Place';

jest.mock('../../config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnThis(),
      whereInIds: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
      getRawOne: jest.fn(),
      where: jest.fn().mockReturnThis(),
    }),
    manager: {
      query: jest.fn(),
    },
    createQueryBuilder: jest.fn().mockReturnValue({
      relation: jest.fn().mockReturnThis(),
      of: jest.fn().mockReturnThis(),
      add: jest.fn(),
      remove: jest.fn(),
    }),
  },
}));

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: any;
  let mockPlaceRepository: any;
  let mockEntityManager: any;
  let mockQueryBuilder: any;

  beforeEach(() => {
    userService = new UserService();
    mockUserRepository = AppDataSource.getRepository(User);
    mockPlaceRepository = AppDataSource.getRepository(Place);
    mockEntityManager = AppDataSource.manager;
    mockQueryBuilder = AppDataSource.createQueryBuilder();
    jest.clearAllMocks();
  });

  describe('getFavorites', () => {
    it('should throw an error if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(userService.getFavorites(1)).rejects.toThrow('User not found');
    });

    it('should return an empty array if user has no favorites', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 });
      mockEntityManager.query.mockResolvedValue([]);
      const favorites = await userService.getFavorites(1);
      expect(favorites).toEqual([]);
    });

    it('should return favorites for a user', async () => {
        const user = { id: 1, username: 'testuser' };
        const favoriteRelations = [{ placeId: 101 }, { placeId: 102 }];
        const places = [
          { id: 101, name: 'Place A', type: 'restaurant', location: 'POINT(10 20)' },
          { id: 102, name: 'Place B', type: 'cafe', location: 'POINT(30 40)' },
        ];
  
        mockUserRepository.findOne.mockResolvedValue(user);
        mockEntityManager.query.mockResolvedValue(favoriteRelations);
  
        const mockPlaceQueryBuilder = {
          whereInIds: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue(places),
        };
        mockPlaceRepository.createQueryBuilder.mockReturnValue(mockPlaceQueryBuilder);
  
        const favorites = await userService.getFavorites(1);
  
        expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockEntityManager.query).toHaveBeenCalledWith('SELECT `placeId` FROM `user_favorites_place` WHERE `userId` = ?', [1]);
        expect(mockPlaceQueryBuilder.whereInIds).toHaveBeenCalledWith([101, 102]);
        expect(favorites).toEqual([
          { id: 101, name: 'Place A', type: 'restaurant', location: { type: 'Point', coordinates: [10, 20] } },
          { id: 102, name: 'Place B', type: 'cafe', location: { type: 'Point', coordinates: [30, 40] } },
        ]);
      });
  });

  describe('addFavorite', () => {
    it('should throw an error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(userService.addFavorite(1, 1)).rejects.toThrow('User not found');
    });

    it('should throw an error if place not found', async () => {
        mockUserRepository.findOne.mockResolvedValue({ id: 1 });
        const mockPlaceQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getRawOne: jest.fn().mockResolvedValue(null),
        };
        mockPlaceRepository.createQueryBuilder.mockReturnValue(mockPlaceQueryBuilder);
        await expect(userService.addFavorite(1, 1)).rejects.toThrow('Place not found');
    });

    it('should return false if favorite already exists', async () => {
        mockUserRepository.findOne.mockResolvedValue({ id: 1 });
        const mockPlaceQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getRawOne: jest.fn().mockResolvedValue({ '1': '1' }),
        };
        mockPlaceRepository.createQueryBuilder.mockReturnValue(mockPlaceQueryBuilder);
        mockEntityManager.query.mockResolvedValue([ { '1': '1' } ]);
        const result = await userService.addFavorite(1, 1);
        expect(result).toBe(false);
    });

    it('should add a favorite and return true', async () => {
        const user = { id: 1 };
        mockUserRepository.findOne.mockResolvedValue(user);
        const mockPlaceQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getRawOne: jest.fn().mockResolvedValue({ '1': '1' }),
        };
        mockPlaceRepository.createQueryBuilder.mockReturnValue(mockPlaceQueryBuilder);
        mockEntityManager.query.mockResolvedValue([]);
      
        const result = await userService.addFavorite(1, 1);
      
        expect(mockQueryBuilder.relation).toHaveBeenCalledWith(User, 'favorites');
        expect(mockQueryBuilder.of).toHaveBeenCalledWith(user);
        expect(mockQueryBuilder.add).toHaveBeenCalledWith(1);
        expect(result).toBe(true);
      });
  });

  describe('removeFavorite', () => {
    it('should throw an error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(userService.removeFavorite(1, 1)).rejects.toThrow('User not found');
    });

    it('should throw an error if place not found', async () => {
        mockUserRepository.findOne.mockResolvedValue({ id: 1 });
        const mockPlaceQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getRawOne: jest.fn().mockResolvedValue(null),
        };
        mockPlaceRepository.createQueryBuilder.mockReturnValue(mockPlaceQueryBuilder);
        await expect(userService.removeFavorite(1, 1)).rejects.toThrow('Place not found');
    });

    it('should throw an error if favorite not found', async () => {
        mockUserRepository.findOne.mockResolvedValue({ id: 1 });
        const mockPlaceQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getRawOne: jest.fn().mockResolvedValue({ '1': '1' }),
        };
        mockPlaceRepository.createQueryBuilder.mockReturnValue(mockPlaceQueryBuilder);
        mockEntityManager.query.mockResolvedValue([]);
        await expect(userService.removeFavorite(1, 1)).rejects.toThrow('Favorite not found');
    });

    it('should remove a favorite', async () => {
        const user = { id: 1, favorites: [] };
        mockUserRepository.findOne.mockResolvedValue(user);
        const mockPlaceQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getRawOne: jest.fn().mockResolvedValue({ '1': '1' }),
        };
        mockPlaceRepository.createQueryBuilder.mockReturnValue(mockPlaceQueryBuilder);
        mockEntityManager.query.mockResolvedValue([ { '1': '1' } ]);
        (userService.getFavorites as jest.Mock) = jest.fn().mockResolvedValue([]);

        const result = await userService.removeFavorite(1, 1);

        expect(mockQueryBuilder.relation).toHaveBeenCalledWith(User, 'favorites');
        expect(mockQueryBuilder.of).toHaveBeenCalledWith(user);
        expect(mockQueryBuilder.remove).toHaveBeenCalledWith(1);
        expect(result.favorites).toEqual([]);
    });
  });
});
