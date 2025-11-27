import { Router } from 'express';
import authRoutes from './auth.js';
import pilotaRoutes from './pilota.js';
import dbRoutes from './db.js';
import msgRoutes from './messages.js';
import { ensureRole } from '../middleware/auth.js';
import { Message, User } from '../models/index.js';

const router = Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'F1 Archívum', active: 'home' });
});

router.get('/admin', ensureRole('admin'), async (req, res) => {
  const msgCount = await Message.count();
  const userCount = await User.count();
  res.render('admin', { title: 'Admin', msgCount, userCount, active: 'admin' });
});

router.use(authRoutes);
router.use('/pilota', pilotaRoutes);
router.use('/adatbazis', dbRoutes);
router.use('/uzenetek', msgRoutes);

// static files in /public are served in server.js with app.use(express.static(...))


export default router;
