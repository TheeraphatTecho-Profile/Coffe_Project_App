import { Router, Request, Response } from 'express';
// NOTE: Backend routes are NOT USED - Frontend uses Firebase Firestore directly
// import { supabase } from '../config/supabase';

const router = Router();

/**
 * DEPRECATED: These routes are not used.
 * Frontend uses Firebase Firestore directly via @react-native-firebase/firestore
 */

/**
 * GET /api/farms — List all farms for the authenticated user.
 */
router.get('/', async (req: Request, res: Response) => {
  return res.status(501).json({ 
    error: 'Not implemented - use Firebase Firestore directly from frontend' 
  });
});

/**
 * POST /api/farms — Create a new farm.
 */
router.post('/', async (req: Request, res: Response) => {
  return res.status(501).json({ 
    error: 'Not implemented - use Firebase Firestore directly from frontend' 
  });
});

/**
 * GET /api/farms/:id — Get a single farm by ID.
 */
router.get('/:id', async (req: Request, res: Response) => {
  return res.status(501).json({ 
    error: 'Not implemented - use Firebase Firestore directly from frontend' 
  });
});

export { router as farmRoutes };
