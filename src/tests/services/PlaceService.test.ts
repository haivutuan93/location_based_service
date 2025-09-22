import { PlaceService } from '../../services/PlaceService';
import { AppDataSource } from '../../config/data-source';
import { Place } from '../../models/Place';

jest.mock('../../config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('PlaceService', () => {
  let placeService: PlaceService;
  let mockPlaceRepository: any;

  beforeEach(() => {
    const getRepositoryMock = AppDataSource.getRepository as jest.Mock;
    mockPlaceRepository = {
      createQueryBuilder: jest.fn(),
    };
    getRepositoryMock.mockReturnValue(mockPlaceRepository);
    placeService = new PlaceService();
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return paginated search results with distance', async () => {
      const latitude = 10;
      const longitude = 20;
      const radius = 5;
      const page = 1;
      const size = 10;

      const mockBaseQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ id: 1, distance: '1.23' }]),
      };

      const mockPlacesQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            name: 'Test Place',
            type: 'restaurant',
            location: 'POINT(10.001 20.001)',
          },
        ]),
      };

      mockPlaceRepository.createQueryBuilder.mockImplementation((alias: string) => {
        if (alias === 'place') {
            // First call in search is for base query, second is for raw places
            if (mockPlaceRepository.createQueryBuilder.mock.calls.length <= 1) {
                return mockBaseQueryBuilder;
            }
            return mockPlacesQueryBuilder;
        }
      });
      

      const result = await placeService.search(latitude, longitude, radius, undefined, undefined, page, size);

      expect(result.total).toBe(1);
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe(1);
      expect(result.data[0].name).toBe('Test Place');
      expect(result.data[0].distance).toBe(1.23);
      expect(result.page).toBe(page);
      expect(result.size).toBe(size);
      expect(result.totalPages).toBe(1);

      expect(mockBaseQueryBuilder.where).toHaveBeenCalled();
      expect(mockBaseQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockBaseQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(mockPlacesQueryBuilder.whereInIds).toHaveBeenCalledWith([1]);
      expect(mockPlacesQueryBuilder.getRawMany).toHaveBeenCalled();
    });

    it('should handle optional name and type filters', async () => {
        const latitude = 10;
        const longitude = 20;
        const radius = 5;
        const name = 'Test';
        const type = 'restaurant';
  
        const mockBaseQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          setParameters: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(0),
        };
  
        mockPlaceRepository.createQueryBuilder.mockReturnValue(mockBaseQueryBuilder);
  
        await placeService.search(latitude, longitude, radius, name, type);
  
        expect(mockBaseQueryBuilder.andWhere).toHaveBeenCalledWith('place.name LIKE :name', { name: `%${name}%` });
        expect(mockBaseQueryBuilder.andWhere).toHaveBeenCalledWith('place.type = :type', { type });
      });

    it('should return empty data when no places are found', async () => {
      const mockBaseQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockPlaceRepository.createQueryBuilder.mockReturnValue(mockBaseQueryBuilder);

      const result = await placeService.search(10, 20, 5);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should return empty data if paginated raw query returns no ids', async () => {
        const mockBaseQueryBuilder = {
            where: jest.fn().mockReturnThis(),
            setParameters: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getCount: jest.fn().mockResolvedValue(1),
            select: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            getRawMany: jest.fn().mockResolvedValue([]),
          };
    
          mockPlaceRepository.createQueryBuilder.mockReturnValue(mockBaseQueryBuilder);

          const result = await placeService.search(10, 20, 5);

          expect(result.data).toEqual([]);
          expect(result.total).toBe(1);
          expect(result.totalPages).toBe(1);
          expect(mockPlaceRepository.createQueryBuilder).toHaveBeenCalledTimes(1);

    });
  });
});
