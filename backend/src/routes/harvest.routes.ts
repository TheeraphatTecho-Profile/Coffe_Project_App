import { Router, Request, Response } from 'express';
// NOTE: Backend routes are NOT USED - Frontend uses Firebase Firestore directly
// import { supabase } from '../config/supabase';

const router = Router();

/**
 * DEPRECATED: These routes are not used.
 * Frontend uses Firebase Firestore directly via @react-native-firebase/firestore
 */

/**
 * GET /api/harvests — List all harvest records.
 */
router.get('/', async (req: Request, res: Response) => {
  return res.status(501).json({ 
    error: 'Not implemented - use Firebase Firestore directly from frontend' 
  });
});

/**
 * POST /api/harvests — Create a new harvest record.
 */
router.post('/', async (req: Request, res: Response) => {
  return res.status(501).json({ 
    error: 'Not implemented - use Firebase Firestore directly from frontend' 
  });
});

/**
 * GET /api/harvests/summary — Get harvest summary statistics.
 */
router.get('/summary', async (req: Request, res: Response) => {
  return res.status(501).json({ 
    error: 'Not implemented - use Firebase Firestore directly from frontend' 
  });
});

export { router as harvestRoutes };
