import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';

export const Pilot = sequelize.define('Pilot', {
  az: { type: DataTypes.INTEGER, primaryKey: true },
  nev: DataTypes.STRING,
  nem: DataTypes.CHAR(1),
  szuldat: DataTypes.DATEONLY,
  nemzet: DataTypes.STRING
}, { tableName: 'pilota', timestamps: false });

export const GrandPrix = sequelize.define('GrandPrix', {
  datum: { type: DataTypes.DATEONLY, primaryKey: true },
  nev: DataTypes.STRING,
  helyszin: DataTypes.STRING
}, { tableName: 'gp', timestamps: false });

export const Result = sequelize.define('Result', {
  datum: { type: DataTypes.DATEONLY, primaryKey: true },
  pilotaaz: { type: DataTypes.INTEGER, primaryKey: true },
  helyezes: { type: DataTypes.INTEGER, allowNull: true },
  hiba: { type: DataTypes.STRING, allowNull: true },
  csapat: DataTypes.STRING,
  tipus: DataTypes.STRING,
  motor: DataTypes.STRING
}, { tableName: 'eredmeny', timestamps: false });

export const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  passwordHash: DataTypes.STRING,
  role: { type: DataTypes.ENUM('visitor', 'registered', 'admin'), defaultValue: 'registered' }
}, { tableName: 'users' });

export const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  content: DataTypes.TEXT
}, { tableName: 'messages', timestamps: true });

Pilot.hasMany(Result, { foreignKey: 'pilotaaz' });
Result.belongsTo(Pilot, { foreignKey: 'pilotaaz' });

GrandPrix.hasMany(Result, { foreignKey: 'datum', sourceKey: 'datum' });
Result.belongsTo(GrandPrix, { foreignKey: 'datum', targetKey: 'datum' });
