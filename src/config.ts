import { registerAs } from '@nestjs/config';

export const config = registerAs('config', () => {
	return {
		serverHost: process.env.SERVER_HOST,
		database: {
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			database: process.env.DB_NAME,
			username: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
		},
		jwtSecret: process.env.JWT_SECRET,
		expiresIn: process.env.EXPIRES_IN,
	};
});
