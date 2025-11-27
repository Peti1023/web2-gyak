import fs from 'fs';
import { sequelize } from './src/sequelize.js';
import { Pilot, GrandPrix, Result, User } from './src/models/index.js';
import { fileURLToPath } from 'url';
import path from 'path';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_SIZE = 100;

/**
 * Read and parse tab-delimited file
 */
function readAndParseTSV(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const rows = data.split('\n').map(line => line.split('	'));
    // Filter out empty rows
    return rows.filter(row => row.some(cell => cell.trim() !== ''));
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Clean string by removing carriage returns and trimming
 */
function cleanString(value) {
  return (value ?? '').replace(/\r/g, '').trim();
}

/**
 * Parse date with fallback
 */
function parseDate(dateString, fallback = '1970-01-01') {
  if (!dateString || dateString.trim() === '') {
    return fallback;
  }
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? fallback : dateString;
}

/**
 * Parse integer safely
 */
function parseIntSafe(value) {
  if (!value || value.trim() === '') return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Process items in batches
 */
async function processBatch(items, batchSize, processor) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processor(batch);
    console.log(`  Processed ${Math.min(i + batchSize, items.length)}/${items.length} records`);
  }
}

class Seeder {
  /**
   * Load default users
   */
  async loadDefaultUsers(dropData = false) {
    console.log('Loading default users...');

    if (dropData) {
      console.log('  Dropping existing User data...');
      await User.destroy({ where: {}, truncate: true });
    }

    const count = await User.count();
    if (count > 0 && !dropData) {
      console.log(`  Skipping: ${count} Users already exist`);
      return;
    }
    if (count > 0 && !dropData) {
      console.log(`  Skipping: ${count} Users already exist`);
      return;
    }

    const users = [
      { email: 'user@user.com', passwordHash: await bcrypt.hash('password', 10), role: 'registered' },
      { email: 'admin@admin.com', passwordHash: await bcrypt.hash('adminpass', 10), role: 'admin' }
    ];
    
    await User.bulkCreate(users, {
      ignoreDuplicates: true
    });

    console.log(`  ✓ Loaded ${users.length} Users`);
  }

  /**
   * Load GP data from file
   */
  async loadGPData(dropData = false) {
    console.log('Loading GP data...');

    if (dropData) {
      console.log('  Dropping existing GP data...');
      await GrandPrix.destroy({ where: {}, truncate: true });
    }

    const count = await GrandPrix.count();
    if (count > 0 && !dropData) {
      console.log(`  Skipping: ${count} GPs already exist`);
      return;
    }

    const filePath = path.join(__dirname, './data/gp.txt');
    const csvData = readAndParseTSV(filePath);
    const [_header, ...rows] = csvData;

    const gps = rows.map(row => ({
      datum: parseDate(row[0]),
      nev: cleanString(row[1]),
      helyszin: cleanString(row[2])
    }));

    await GrandPrix.bulkCreate(gps, {
      ignoreDuplicates: true
    });

    console.log(`  ✓ Loaded ${gps.length} GPs`);
  }

  /**
   * Load Pilot data from file
   */
  async loadPilotData(dropData = false) {
    console.log('Loading Pilot data...');

    if (dropData) {
      console.log('  Dropping existing Pilot data...');
      await Pilot.destroy({ where: {}, truncate: true });
    }

    const count = await Pilot.count();
    if (count > 0 && !dropData) {
      console.log(`  Skipping: ${count} Pilots already exist`);
      return;
    }

    const filePath = path.join(__dirname, './data/pilota.txt');
    const csvData = readAndParseTSV(filePath);
    const [_header, ...rows] = csvData;

    const pilots = rows.map(row => ({
      az: parseIntSafe(row[0]) ?? 0,
      nev: cleanString(row[1]),
      nem: cleanString(row[2]),
      szuldat: parseDate(row[3]),
      nemzet: cleanString(row[4])
    }));

    await Pilot.bulkCreate(pilots, {
      ignoreDuplicates: true
    });

    console.log(`  ✓ Loaded ${pilots.length} Pilots`);
  }

  /**
   * Load Result data from file
   */
  async loadResultData(dropData = false) {
    console.log('Loading Result data...');

    if (dropData) {
      console.log('  Dropping existing Result data...');
      await Result.destroy({ where: {}, truncate: true });
    }

    const count = await Result.count();
    if (count > 0 && !dropData) {
      console.log(`  Skipping: ${count} Results already exist`);
      return;
    }

    const filePath = path.join(__dirname, './data/eredmeny.txt');
    const csvData = readAndParseTSV(filePath);
    const [_header, ...rows] = csvData;

    const results = rows.map(row => ({
      datum: parseDate(row[0]),
      pilotaaz: parseIntSafe(row[1]) ?? 0,
      helyezes: parseIntSafe(row[2]),
      hiba: cleanString(row[3]) || null,
      csapat: cleanString(row[4]) || null,
      tipus: cleanString(row[5]) || null,
      motor: cleanString(row[6]) || null
    }));

    await processBatch(results, BATCH_SIZE, async (batch) => {
      await Result.bulkCreate(batch, {
        ignoreDuplicates: true
      });
    });

    console.log(`  ✓ Loaded ${results.length} Results`);
  }

  /**
   * Seed all data
   */
  async seedAll(dropData = false) {
    console.log('Seeding all data...\n');

    if (dropData) {
      console.log('Dropping all data (respecting foreign key constraints)...\n');
      // Delete in reverse order due to foreign key constraints
      await Result.destroy({ where: {}, truncate: true, cascade: true });
      await GrandPrix.destroy({ where: {}, truncate: true, cascade: true });
      await Pilot.destroy({ where: {}, truncate: true, cascade: true });
      await User.destroy({ where: {}, truncate: true, cascade: true });
      console.log('✓ All data dropped\n');
    }

    // Order matters due to foreign key constraints
    // Insert parents before children
    await this.loadPilotData(false);  // Don't drop again, already done above
    await this.loadGPData(false);
    await this.loadResultData(false);
    await this.loadDefaultUsers(false);
    
    console.log('\n✓ All seeding completed successfully!');
  }
}

async function main() {
  const seeder = new Seeder();
  const args = process.argv.slice(2);

  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.\n');
    
    // Sync database schema
    await sequelize.sync({ force: args.includes('--force') });

    const shouldDropData = args.includes('--drop-data');
    const loadGPs = args.includes('--load-gps');
    const loadPilots = args.includes('--load-pilots');
    const loadResults = args.includes('--load-results');
    const loadUsers = args.includes('--load-users');
    const loadAll = args.includes('--all') || args.length === 0;

    if (loadAll) {
      await seeder.seedAll(shouldDropData);
    } else {
      if (loadPilots) {
        await seeder.loadPilotData(shouldDropData);
      }
      if (loadGPs) {
        await seeder.loadGPData(shouldDropData);
      }
      if (loadResults) {
        await seeder.loadResultData(shouldDropData);
      }
        if (loadUsers) {
          await seeder.loadDefaultUsers(shouldDropData);
        }
    }

    console.log('\n✓ Seeding process completed successfully');
  } catch (error) {
    console.error('\n✗ Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();