import * as dotnev from 'dotenv';
import { DataSource } from 'typeorm';

dotnev.config();

export const AppDataSource = new DataSource({
	type: 'postgres',
	url: process.env.DB_URL,
	synchronize: false,
	logging: false,
	entities: ['src/**/*.entity.ts'],
	migrations: ['src/database/migrations/*.ts'],
	migrationsTableName: 'migrations',
});
