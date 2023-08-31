import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../../users/services/users.service';
import { DocumentsService } from '../services/documents.service';
import { User } from '../../users/entities/user.entity';
import { Document } from '../entities/document.entity';
import { MockRepository } from '../../interfaces/mock-repository.interface';
import { JwtGuard } from '../../users/guards/jwt.guard';
import {
	CanActivate,
	ClassSerializerInterceptor,
	ExecutionContext,
	INestApplication,
	ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserMock } from '../../users/mocks/user.mock';
import { DocumentMock } from '../mocks/document.mock';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { In } from 'typeorm';

jest.mock('typeorm', () => {
	const originalModule = jest.requireActual('typeorm');

	return {
		__esModule: true,
		...originalModule,
		In: jest.fn(),
	};
});

describe('DocumentsController', () => {
	enum Routes {
		DOCS = '/documents',
		MY_DOCS = '/documents/my_documents',
		DOWNLOAD = '/documents/download',
	}
	let app: INestApplication;
	const mockUserRepository = {} as MockRepository;
	const mockDocumentRepository = {} as MockRepository;
	const mockJwtGuard: CanActivate = {
		canActivate: jest.fn(() => true),
	};

	let userMock: UserMock;
	let documentMock: DocumentMock;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [DocumentsController],
			providers: [
				DocumentsService,
				UsersService,
				{
					provide: getRepositoryToken(Document),
					useValue: mockDocumentRepository,
				},
				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepository,
				},
			],
		})
			.overrideGuard(JwtGuard)
			.useValue(mockJwtGuard)
			.compile();

		documentMock = new DocumentMock(true);
		userMock = new UserMock();

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

	describe(`${Routes.DOCS} (GET)`, () => {
		beforeEach(() => {
			mockDocumentRepository.find = jest.fn();
			mockDocumentRepository.find.mockImplementation(() =>
				documentMock.find(),
			);
		});

		it('OK 200', async () => {
			return request(app.getHttpServer())
				.get(Routes.DOCS)
				.expect(200)
				.then(({ body }) => {
					expect(body).toEqual(documentMock.findMethodResult);
				});
		});
	});

	describe(`${Routes.MY_DOCS} (GET)`, () => {
		let id: number;
		beforeEach(() => {
			mockDocumentRepository.find = jest.fn();

			id = faker.number.int({ min: 1, max: 255 });

			mockDocumentRepository.find.mockImplementation((args) =>
				documentMock.find(args),
			);
			mockJwtGuard.canActivate = jest.fn((cxt: ExecutionContext) => {
				const request = cxt.switchToHttp().getRequest();
				request.user = { sub: id };
				return true;
			});
		});

		it('OK 200', async () => {
			return request(app.getHttpServer())
				.get(Routes.MY_DOCS)
				.expect(200)
				.then(({ body }: request.Response) => {
					expect(body).toEqual(documentMock.findMethodResult);
				});
		});
	});
});
