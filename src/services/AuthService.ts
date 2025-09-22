import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppDataSource } from '../config/data-source';

const userRepository = AppDataSource.getRepository(User);

export class AuthService {
  async register(userData: Partial<User>): Promise<User> {
    const { email, password } = userData;
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({ ...userData, password: hashedPassword });
    return await userRepository.save(newUser);
  }

  async login(email: string, password: string): Promise<string | null> {
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'location_based_service', {
      expiresIn: '2h',
    });

    return token;
  }
}
