import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { MockRepository } from '../../interfaces/mock-repository.interface';
import { UserMock } from '../mocks/user.mock';
import {
	ClassSerializerInterceptor,
	INestApplication,
	ValidationPipe,
} from '@nestjs/common';

describe('UsersController', () => {
	enum Routes {
		LIST = '/users',
	}
	let app: INestApplication;
	const mockUserRepository = {} as MockRepository;
	let userMock: UserMock;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepository,
				},
			],
		}).compile();

		userMock = new UserMock(true);

		app = module.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transformOptions: {
					enableImplicitConversion: true,
				},
				transform: true,
			}),
		);
		app.useGlobalInterceptors(
			new ClassSerializerInterceptor(app.get(Reflector)),
		);
		await app.init();
	});

	it(`${Routes.LIST} (GET)`, () => {
		mockUserRepository.find = jest.fn();
		mockUserRepository.find.mockImplementation(() => userMock.find());

		return request(app.getHttpServer())
			.get(Routes.LIST)
			.expect(200)
			.then(({ body }) => {
				expect(body).toEqual(userMock.findMethodResult);
			});
	});
});
