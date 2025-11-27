import { Router } from 'express';
import { Pilot } from '../models/index.js';
import { ensureRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const list = await Pilot.findAll({ order: [['az','ASC']], limit: 1000 });
  res.render('pilota/index', { title: 'Pilóták', list, active: 'pilota' });
});

router.get('/uj', ensureRole('admin'), (req, res) => {
  res.render('pilota/new', { title: 'Új pilóta', active: 'pilota' });
});

router.post('/', ensureRole('admin'), async (req, res) => {
  try {
    await Pilot.create(req.body);
    req.flash('success', 'Pilóta létrehozva.');
    res.redirect('/app014/pilota');
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/app014/pilota/uj');
  }
});

router.get('/:az/szerkeszt', ensureRole('admin'), async (req, res) => {
  const item = await Pilot.findByPk(req.params.az);
  res.render('pilota/edit', { title: 'Pilóta szerkesztése', item, active: 'pilota' });
});

router.post('/:az', ensureRole('admin'), async (req, res) => {
  try {
    const item = await Pilot.findByPk(req.params.az);
    await item.update(req.body);
    req.flash('success', 'Mentve.');
    res.redirect('/app014/pilota');
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/app014/pilota');
  }
});

router.post('/:az/delete', ensureRole('admin'), async (req, res) => {
  try {
    await Pilot.destroy({ where: { az: req.params.az }});
    req.flash('success', 'Törölve.');
    res.redirect('/app014/pilota');
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/app014/pilota');
  }
});

export default router;
