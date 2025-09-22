import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

export class UserController {
  private userService = new UserService();

  getFavorites = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const favorites = await this.userService.getFavorites(userId);
      res.status(200).json(favorites);
    } catch (error) {
        if (error instanceof Error) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
  };

  addFavorite = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { placeId } = req.body;
      if (!placeId) {
        return res.status(400).json({ message: 'Place ID is required' });
      }
      const wasAdded = await this.userService.addFavorite(userId, placeId);
      if (wasAdded) {
        res.status(200).json({ message: 'Place added to favorites' });
      } else {
        res.status(200).json({ message: 'Place is already in favorites' });
      }
    } catch (error) {
        if (error instanceof Error) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
  };

  removeFavorite = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { placeId } = req.params;
      await this.userService.removeFavorite(userId, Number(placeId));
      res.status(200).json({ message: 'Place removed from favorites' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
  };
}
