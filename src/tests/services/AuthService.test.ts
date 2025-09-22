import { AuthService } from '../../services/AuthService';
import { AppDataSource } from '../../config/data-source';
import { User } from '../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    }),
  },
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: any;

  beforeEach(() => {
    authService = new AuthService();
    mockUserRepository = AppDataSource.getRepository(User);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw an error if email or password is not provided', async () => {
      await expect(authService.register({ email: 'test@test.com' })).rejects.toThrow('Email and password are required');
    });

    it('should throw an error if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, email: 'test@test.com' });
      await expect(authService.register({ email: 'test@test.com', password: 'password' })).rejects.toThrow('User already exists');
    });

    it('should create and return a new user', async () => {
      const userData = { email: 'new@test.com', password: 'password' };
      const hashedPassword = 'hashedpassword';
      const newUser = { id: 1, ...userData, password: hashedPassword };

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await authService.register(userData);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: userData.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({ ...userData, password: hashedPassword });
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });

  describe('login', () => {
    it('should return null if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const token = await authService.login('notfound@test.com', 'password');
      expect(token).toBeNull();
    });

    it('should return null if password is not valid', async () => {
      const user = { id: 1, email: 'test@test.com', password: 'hashedpassword' };
      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const token = await authService.login('test@test.com', 'wrongpassword');
      expect(token).toBeNull();
    });

    it('should return a JWT token on successful login', async () => {
      const user = { id: 1, email: 'test@test.com', password: 'hashedpassword' };
      const mockToken = 'mock-jwt-token';
      process.env.JWT_SECRET = 'test_secret';

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = await authService.login('test@test.com', 'password');

      expect(jwt.sign).toHaveBeenCalledWith({ id: user.id, email: user.email }, 'test_secret', { expiresIn: '2h' });
      expect(token).toBe(mockToken);
    });
  });
});
