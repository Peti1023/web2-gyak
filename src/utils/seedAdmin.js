import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { sequelize } from '../sequelize.js';
import '../loadEnv.js';

(async () => {
  await sequelize.authenticate();
  await sequelize.sync();
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const pass = process.env.ADMIN_PASSWORD || 'Admin123!';
  const hash = await bcrypt.hash(pass, 10);
  await User.findOrCreate({ where: { email }, defaults: { passwordHash: hash, role: 'admin' } });
  console.log('Admin létrehozva:', email);
  process.exit(0);
})();
