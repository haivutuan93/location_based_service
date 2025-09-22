import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import Joi from 'joi';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService = new AuthService()) {
    this.authService = authService;
  }
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }

      const user = await this.authService.register(value);
      res.status(201).json({ id: user.id, email: user.email });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
      }

      const { email, password } = value;
      const token = await this.authService.login(email, password);

      if (!token) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      res.status(200).json({ token });
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
