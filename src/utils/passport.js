import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { User } from '../models/index.js';

export default function initPassport(passport) {
  passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return done(null, false, { message: 'Hibás email/jelszó' });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return done(null, false, { message: 'Hibás email/jelszó' });
      return done(null, user);
    } catch (e) {
      return done(e);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (e) {
      done(e);
    }
  });
}
