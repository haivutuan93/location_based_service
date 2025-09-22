import { AuthController } from '../../controllers/AuthController';
import { AuthService } from '../../services/AuthService';
import { Request, Response } from 'express';

jest.mock('../../services/AuthService');

const mockRequest = (body: any) => ({
  body,
});

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    authController = new AuthController(mockAuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a user and return user info', async () => {
      const req = mockRequest({ email: 'test@test.com', password: 'password' });
      const res = mockResponse();
      const user = { id: 1, email: 'test@test.com' };

      mockAuthService.register.mockResolvedValue(user as any);

      await authController.register(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, email: 'test@test.com' });
    });

    it('should return 400 for invalid registration data', async () => {
      const req = mockRequest({ email: 'test', password: 'password' });
      const res = mockResponse();

      await authController.register(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: '"email" must be a valid email' });
    });

    it('should return 400 if user already exists', async () => {
        const req = mockRequest({ email: 'exists@test.com', password: 'password' });
        const res = mockResponse();
        mockAuthService.register.mockRejectedValue(new Error('User already exists'));
  
        await authController.register(req as Request, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
      });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      const req = mockRequest({ email: 'test@test.com', password: 'password' });
      const res = mockResponse();
      const token = 'jwt-token';
      mockAuthService.login.mockResolvedValue(token);

      await authController.login(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token });
    });

    it('should return 400 for invalid login data', async () => {
      const req = mockRequest({ email: 'test@test.com' });
      const res = mockResponse();
      
      await authController.login(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: '"password" is required' });
    });

    it('should return 401 for invalid credentials', async () => {
      const req = mockRequest({ email: 'test@test.com', password: 'wrongpassword' });
      const res = mockResponse();
      mockAuthService.login.mockResolvedValue(null);

      await authController.login(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 500 for internal server errors', async () => {
        const req = mockRequest({ email: 'test@test.com', password: 'password' });
        const res = mockResponse();
        mockAuthService.login.mockRejectedValue(new Error('Internal error'));
  
        await authController.login(req as Request, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
      });
  });
});
