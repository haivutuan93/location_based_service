import { Router } from 'express';
import { PlaceController } from '../controllers/PlaceController';

const router = Router();
const placeController = new PlaceController();

router.get('/search', placeController.search);

export default router;

