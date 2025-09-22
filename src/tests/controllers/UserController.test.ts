import { UserController } from '../../controllers/UserController';
import { UserService } from '../../services/UserService';
import { Request, Response } from 'express';

jest.mock('../../services/UserService');

const mockRequest = (user: any, body?: any, params?: any) => ({
  user,
  body: body || {},
  params: params || {},
});

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;

  beforeEach(() => {
    userController = new UserController();
    mockUserService = new UserService() as jest.Mocked<UserService>;
    (userController as any).userService = mockUserService;
  });

  describe('getFavorites', () => {
    it('should return a list of favorites', async () => {
      const req = mockRequest({ id: 1 });
      const res = mockResponse();
      const favorites = [{ id: 1, name: 'Favorite Place' }];
      mockUserService.getFavorites.mockResolvedValue(favorites);

      await userController.getFavorites(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(favorites);
    });

    it('should handle errors when getting favorites', async () => {
      const req = mockRequest({ id: 1 });
      const res = mockResponse();
      mockUserService.getFavorites.mockRejectedValue(new Error('User not found'));

      await userController.getFavorites(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('addFavorite', () => {
    it('should add a favorite place', async () => {
      const req = mockRequest({ id: 1 }, { placeId: 100 });
      const res = mockResponse();
      mockUserService.addFavorite.mockResolvedValue(true);

      await userController.addFavorite(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Place added to favorites' });
    });

    it('should return a message if favorite already exists', async () => {
      const req = mockRequest({ id: 1 }, { placeId: 100 });
      const res = mockResponse();
      mockUserService.addFavorite.mockResolvedValue(false);

      await userController.addFavorite(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Place is already in favorites' });
    });

    it('should return 400 if placeId is not provided', async () => {
      const req = mockRequest({ id: 1 }, {});
      const res = mockResponse();

      await userController.addFavorite(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Place ID is required' });
    });

    it('should handle errors when adding a favorite', async () => {
      const req = mockRequest({ id: 1 }, { placeId: 100 });
      const res = mockResponse();
      mockUserService.addFavorite.mockRejectedValue(new Error('Place not found'));

      await userController.addFavorite(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Place not found' });
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite place', async () => {
      const req = mockRequest({ id: 1 }, {}, { placeId: '100' });
      const res = mockResponse();
      mockUserService.removeFavorite.mockResolvedValue({} as any);

      await userController.removeFavorite(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Place removed from favorites' });
    });

    it('should handle errors when removing a favorite', async () => {
      const req = mockRequest({ id: 1 }, {}, { placeId: '100' });
      const res = mockResponse();
      mockUserService.removeFavorite.mockRejectedValue(new Error('Favorite not found'));

      await userController.removeFavorite(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Favorite not found' });
    });
  });
});
