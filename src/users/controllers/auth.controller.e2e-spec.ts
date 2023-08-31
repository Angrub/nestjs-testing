import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserMock } from '../mocks/user.mock';
import {
	INestApplication,
	ValidationPipe,
	ClassSerializerInterceptor,
} from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { MockRepository } from 'src/interfaces/mock-repository.interface';
import { MockJwtService } from '../services/auth.service.spec';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { hash } from 'bcrypt';

describe('AuthController', () => {
	enum Routes {
		LOGIN = '/auth/login',
		REGISTER = '/auth/register',
	}
	let app: INestApplication;
	const mockUserRepository = {} as MockRepository;
	const mockJwtService = {} as MockJwtService;

	let userMock: UserMock;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				AuthService,
				UsersService,
				{
					provide: JwtService,
					useValue: mockJwtService,
				},
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

	describe(`${Routes.LOGIN} (POST)`, () => {
		let fakeLoginDto: LoginDto;
		let jwtToken: string;

		beforeEach(() => {
			// mock init
			mockJwtService.sign = jest.fn();
			mockUserRepository.findOne = jest.fn();

			// fake data
			const fakeUser = userMock.generateUser();
			fakeLoginDto = {
				password: fakeUser.password,
				email: fakeUser.email,
			};
			jwtToken = JSON.stringify(fakeLoginDto);

			// mock implementation
			mockJwtService.sign.mockReturnValue(jwtToken);
		});

		it('OK 200', async () => {
			// individual implementation
			mockUserRepository.findOne.mockImplementation(async (args) => {
				const user = await userMock.findOne(args);
				user.password = await hash(fakeLoginDto.password, 10);
				userMock.findOneMethodResult = { ...user };
				return user;
			});

			return request(app.getHttpServer())
				.post(Routes.LOGIN)
				.send(fakeLoginDto)
				.expect(200)
				.then(({ body }) => {
					expect(body).toEqual({
						access_token: jwtToken,
						user: userMock.findOneMethodResult,
					});
				});
		});

		it('Unauthorized 401', async () => {
			// individual implementation
			mockUserRepository.findOne.mockResolvedValue(undefined);

			return request(app.getHttpServer())
				.post(Routes.LOGIN)
				.send(fakeLoginDto)
				.expect(401)
				.then(({ body }) => {
					expect(body.message).toBe('Email or password are wrong');
				});
		});

		it('Unauthorized 401 2nd', async () => {
			// individual implementation
			mockUserRepository.findOne.mockImplementation(async (args) => {
				const user = await userMock.findOne(args);
				user.password += fakeLoginDto.password;
				user.password = await hash(user.password + '123', 10);
				userMock.findOneMethodResult = { ...user };
				return user;
			});

			return request(app.getHttpServer())
				.post(Routes.LOGIN)
				.send(fakeLoginDto)
				.expect(401)
				.then(({ body }) => {
					expect(body.message).toBe('Email or password are wrong');
				});
		});
	});

	describe(`${Routes.REGISTER} (POST)`, () => {
		let fakeRegisterDto: RegisterDto;
		let jwtToken: string;

		beforeEach(() => {
			// mock init
			mockJwtService.sign = jest.fn();
			mockUserRepository.findOne = jest.fn();
			mockUserRepository.create = jest.fn();
			mockUserRepository.save = jest.fn();

			// fake data
			const fakeUser = userMock.generateUser();
			fakeRegisterDto = {
				password: fakeUser.password,
				passwordConfirm: fakeUser.password,
				email: fakeUser.email,
				publicKey: fakeUser.publicKey,
				firstName: fakeUser.firstName,
				lastName: fakeUser.lastName,
			};
			jwtToken = JSON.stringify(fakeRegisterDto);

			// mock implementation
			mockJwtService.sign.mockReturnValue(jwtToken);
			mockUserRepository.create.mockImplementation((args) =>
				userMock.create(args),
			);
			mockUserRepository.save.mockImplementation((args) =>
				userMock.save(args),
			);
		});

		it('Created 201', async () => {
			// individual implementation
			mockUserRepository.findOne.mockResolvedValue(undefined);

			return request(app.getHttpServer())
				.post(Routes.REGISTER)
				.send(fakeRegisterDto)
				.expect(201)
				.then(({ body }) => {
					expect(body).toEqual({
						access_token: jwtToken,
						user: userMock.saveMethodResult,
					});
				});
		});

		it('Bad request 400', async () => {
			// individual implementation
			mockUserRepository.findOne.mockImplementation((args) =>
				userMock.findOne(args),
			);

			return request(app.getHttpServer())
				.post(Routes.REGISTER)
				.send(fakeRegisterDto)
				.expect(400)
				.then(({ body }) => {
					expect(body.message).toBe('User already exists');
				});
		});
	});
});
