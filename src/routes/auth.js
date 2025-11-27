import { Router } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { User } from '../models/index.js';

const router = Router();

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Regisztráció', active: 'auth' });
});

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ email, passwordHash, role: 'registered' });
    req.flash('success', 'Sikeres regisztráció! Jelentkezz be.');
    res.redirect('/app014/login');
  } catch (e) {
    req.flash('error', 'Regisztrációs hiba: ' + e.message);
    res.redirect('/app014/register');
  }
});

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Bejelentkezés', active: 'auth' });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/app014',
  failureRedirect: '/app014/login',
  failureFlash: true
}));

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'Kijelentkezve.');
    res.redirect('/app014');
  });
});

export default router;
