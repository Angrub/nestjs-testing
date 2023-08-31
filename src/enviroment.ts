import * as Joi from 'joi';

export const enviroments = {
	local: '.env',
	prod: '.prod.env',
};

export const enviromentSchema = Joi.object({
	SERVER_HOST: Joi.string().required(),
	DB_HOST: Joi.string().required(),
	DB_PORT: Joi.number().required(),
	DB_NAME: Joi.string().required(),
	DB_USER: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	JWT_SECRET: Joi.string().required(),
	EXPIRES_IN: Joi.string().required(),
});
