import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../sequelize.js';
import { Pilot, GrandPrix, Result, User } from '../models/index.js';
import bcrypt from 'bcrypt';
import '../loadEnv.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseTSV(filePath) {
  const raw = fs.readFileSync(filePath, 'latin1').split('\n');
  const rows = raw.filter(Boolean);
  const header = rows.shift().split('\t');
  const data = rows.map(line => {
    const cols = line.split('\t');
    const obj = {};
    header.forEach((h, i) => obj[h.trim()] = (cols[i]||'').trim());
    return obj;
  });
  return data;
}

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const dataDir = path.join(__dirname, '../../data');

    const pilots = parseTSV(path.join(dataDir, 'pilota.txt'));
    for (const p of pilots) {
      await Pilot.upsert({
        az: Number(p['az']),
        nev: p['nev'],
        nem: (p['nem']||'').slice(0,1),
        szuldat: p['szuldat'] ? p['szuldat'].replaceAll('.', '-').replace(/-$/,'') : null,
        nemzet: p['nemzet']
      });
    }
    console.log('Pilóták betöltve:', pilots.length);

    const gps = parseTSV(path.join(dataDir, 'gp.txt'));
    for (const g of gps) {
      await GrandPrix.upsert({
        datum: g['datum'] ? g['datum'].replaceAll('.', '-').replace(/-$/,'') : null,
        nev: g['nev'],
        helyszin: g['helyszin']
      });
    }
    console.log('GP-k betöltve:', gps.length);

    const resList = parseTSV(path.join(dataDir, 'eredmeny.txt'));
    let count = 0;
    for (const r of resList) {
      try {
        await Result.upsert({
          datum: r['datum'] ? r['datum'].replaceAll('.', '-').replace(/-$/,'') : null,
          pilotaaz: r['pilotaaz'] ? Number(r['pilotaaz']) : null,
          helyezes: r['helyezes'] ? Number(r['helyezes']) : null,
          hiba: r['hiba'] || null,
          csapat: r['csapat'],
          tipus: r['tipus'],
          motor: r['motor']
        });
        count++;
      } catch (e) {
        // skip malformed rows
      }
    }
    console.log('Eredmények betöltve:', count);

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const pass = process.env.ADMIN_PASSWORD || 'Admin123!';
    const hash = await bcrypt.hash(pass, 10);
    await User.findOrCreate({ where: { email }, defaults: { passwordHash: hash, role: 'admin' } });
    console.log('Admin user készen:', email);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
