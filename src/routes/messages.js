import { Router } from 'express';
import { ensureAuth } from '../middleware/auth.js';
import { Message } from '../models/index.js';

const router = Router();

router.get('/', ensureAuth, async (req, res) => {
  const list = await Message.findAll({ order: [['createdAt','DESC']] });
  res.render('messages/index', { title: 'Üzenetek', list, active: 'messages' });
});

router.get('/kapcsolat', (req, res) => {
  res.render('messages/contact', { title: 'Kapcsolat', active: 'messages' });
});

router.post('/kapcsolat', async (req, res) => {
  const { name, email, content } = req.body;
  await Message.create({ name, email, content });
  req.flash('success', 'Üzenet elküldve!');
  res.redirect('/uzenetek/kapcsolat');
});

export default router;
