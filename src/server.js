import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import path from 'path';
import ejsLayouts from 'express-ejs-layouts';
import passport from 'passport';
import './loadEnv.js';
import { fileURLToPath } from 'url';

import { sequelize } from './sequelize.js';
import initPassport from './utils/passport.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layouts/main');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

initPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL kapcsolat rendben.');
    await sequelize.sync();
  } catch (e) {
    console.error('Adatbázis hiba:', e);
  }
})();

export default app;
