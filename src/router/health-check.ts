import { logger } from '../helpers/logger.helper';
import { Request, Response, Router } from 'express';

const router = Router();

router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
  logger.log('info', { name: 'router.healthCheck.ok' });
});

export default router;
