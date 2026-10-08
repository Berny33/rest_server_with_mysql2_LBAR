import { Router } from 'express';
import productRoutes from './products.routes';

const router = Router();

router.use('/products', productRoutes);

export default router;