import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const userController = new UserController();

router.get('/favorites', authMiddleware, userController.getFavorites);
router.post('/favorites', authMiddleware, userController.addFavorite);
router.delete('/favorites/:placeId', authMiddleware, userController.removeFavorite);

export default router;
