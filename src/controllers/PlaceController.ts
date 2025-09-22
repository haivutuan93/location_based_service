import { Request, Response } from 'express';
import { PlaceService } from '../services/PlaceService';
import * as Joi from 'joi';

const searchSchema = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  radius: Joi.number().required(),
  name: Joi.string().optional(),
  type: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().integer().min(1).default(10),
});

export class PlaceController {
  private placeService = new PlaceService();

  search = async (req: Request, res: Response) => {
    try {
      const { error, value } = searchSchema.validate(req.query);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const { latitude, longitude, radius, name, type, page, size } = value;
      const result = await this.placeService.search(
        latitude,
        longitude,
        radius,
        name,
        type,
        page,
        size
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error searching for places' });
    }
  };
}

