import { Router } from 'express';
import { Pilot, Result, GrandPrix } from '../models/index.js';

const router = Router();

router.get('/', async (req, res) => {
  const pilots = await Pilot.findAll({ limit: 10 });
  const gps = await GrandPrix.findAll({ limit: 10 });
  const results = await Result.findAll({ limit: 10 });
  res.render('db/index', { title: 'Adatbázis', pilots, gps, results, active: 'db' });
});

export default router;
