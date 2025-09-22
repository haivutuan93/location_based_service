import { PlaceController } from '../../controllers/PlaceController';
import { PlaceService } from '../../services/PlaceService';
import { Request, Response } from 'express';

jest.mock('../../services/PlaceService');

const mockRequest = (query: any) => ({
  query,
});

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('PlaceController', () => {
  let placeController: PlaceController;
  let mockPlaceService: jest.Mocked<PlaceService>;

  beforeEach(() => {
    placeController = new PlaceController();
    mockPlaceService = new PlaceService() as jest.Mocked<PlaceService>;
    (placeController as any).placeService = mockPlaceService;
  });

  describe('search', () => {
    it('should return search results from the place service', async () => {
      const req = mockRequest({
        latitude: '10',
        longitude: '20',
        radius: '5000',
        page: '1',
        size: '10',
      });
      const res = mockResponse();
      const searchResult = {
        data: [],
        total: 0,
        page: 1,
        size: 10,
        totalPages: 0,
      };
      mockPlaceService.search.mockResolvedValue(searchResult);

      await placeController.search(req as any, res);

      expect(res.json).toHaveBeenCalledWith(searchResult);
      expect(mockPlaceService.search).toHaveBeenCalledWith(10, 20, 5000, undefined, undefined, 1, 10);
    });

    it('should return a 400 error for invalid query parameters', async () => {
      const req = mockRequest({
        longitude: '20',
        radius: '5000',
      });
      const res = mockResponse();

      await placeController.search(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: '"latitude" is required' });
    });

    it('should handle errors from the place service', async () => {
      const req = mockRequest({
        latitude: '10',
        longitude: '20',
        radius: '5000',
      });
      const res = mockResponse();
      mockPlaceService.search.mockRejectedValue(new Error('Service error'));

      await placeController.search(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error searching for places' });
    });
  });
});
