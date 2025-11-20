import { Sequelize } from 'sequelize';
import './loadEnv.js';

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'forma1',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: 'mysql',
    logging: false
  }
);
