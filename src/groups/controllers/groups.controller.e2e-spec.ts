import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentsService } from '../../documents/services/documents.service';
import { UsersService } from '../../users/services/users.service';
import { Group } from '../entities/groups.entity';
import { GroupsService } from '../services/groups.service';
import { User } from '../../users/entities/user.entity';
import { Document } from '../../documents/entities/document.entity';
import {
	CanActivate,
	ClassSerializerInterceptor,
	INestApplication,
	ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { DocumentMock } from '../../documents/mocks/document.mock';
import { MockRepository } from '../../interfaces/mock-repository.interface';
import { UserMock } from '../../users/mocks/user.mock';
import { GroupMock } from '../mocks/group.mock';
import { Reflector } from '@nestjs/core';
import { JwtGuard } from '../../users/guards/jwt.guard';
import { faker } from '@faker-js/faker';
import {
	AddDocumentDto,
	AddUsersDto,
	CreateGroupDto,
} from '../dtos/groups.dto';
import { In } from 'typeorm';

jest.mock('typeorm', () => {
	const originalModule = jest.requireActual('typeorm');

	return {
		__esModule: true,
		...originalModule,
		In: jest.fn(),
	};
});

describe('GroupsController', () => {
	enum Routes {
		GROUPS = '/groups',
		USERS = '/groups/users',
		DOCS = '/groups/documents',
	}
	let app: INestApplication;
	const mockGroupRepository = {} as MockRepository;
	const mockUserRepository = {} as MockRepository;
	const mockDocumentRepository = {} as MockRepository;
	const mockJwtGuard: CanActivate = { canActivate: jest.fn(() => true) };

	let groupMock: GroupMock;
	let userMock: UserMock;
	let documentMock: DocumentMock;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GroupsController],
			providers: [
				UsersService,
				DocumentsService,
				GroupsService,
				{
					provide: getRepositoryToken(Group),
					useValue: mockGroupRepository,
				},
				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepository,
				},
				{
					provide: getRepositoryToken(Document),
					useValue: mockDocumentRepository,
				},
			],
		})
			.overrideGuard(JwtGuard)
			.useValue(mockJwtGuard)
			.compile();

		groupMock = new GroupMock(true);
		userMock = new UserMock();
		documentMock = new DocumentMock();

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

	describe(`${Routes.GROUPS} (GET)`, () => {
		beforeEach(() => {
			mockGroupRepository.find = jest.fn();
			mockGroupRepository.find.mockImplementation(() => groupMock.find());
		});

		it('OK 200', async () => {
			return request(app.getHttpServer())
				.get(Routes.GROUPS)
				.expect(200)
				.then(({ body }) => {
					expect(body).toEqual(groupMock.findMethodResult);
				});
		});
	});

	describe(`${Routes.USERS}/:id AND ${Routes.DOCS}/:id (GET)`, () => {
		let groupId: number;
		beforeEach(() => {
			mockGroupRepository.findOne = jest.fn();
			groupId = faker.number.int({ min: 1, max: 255 });
		});

		it(`${Routes.USERS}/${groupId} OK 200`, async () => {
			mockGroupRepository.findOne.mockImplementation((args) =>
				groupMock.findOne(args),
			);

			return request(app.getHttpServer())
				.get(`${Routes.USERS}/${groupId}`)
				.expect(200)
				.then(({ body }) => {
					expect(body).toEqual(groupMock.findOneMethodResult);
				});
		});

		it(`${Routes.USERS}/${groupId} Not Found 404`, async () => {
			mockGroupRepository.findOne.mockResolvedValue(undefined);

			return request(app.getHttpServer())
				.get(`${Routes.USERS}/${groupId}`)
				.expect(404)
				.then(({ body }) => {
					expect(body.message).toBe(`Group #${groupId} not found`);
				});
		});

		it(`${Routes.DOCS}/${groupId} OK 200`, async () => {
			mockGroupRepository.findOne.mockImplementation((args) =>
				groupMock.findOne(args),
			);

			return request(app.getHttpServer())
				.get(`${Routes.DOCS}/${groupId}`)
				.expect(200)
				.then(({ body }) => {
					expect(body).toEqual(groupMock.findOneMethodResult);
				});
		});

		it(`${Routes.DOCS}/${groupId} Not Found 404`, async () => {
			mockGroupRepository.findOne.mockResolvedValue(undefined);

			return request(app.getHttpServer())
				.get(`${Routes.DOCS}/${groupId}`)
				.expect(404)
				.then(({ body }) => {
					expect(body.message).toBe(`Group #${groupId} not found`);
				});
		});
	});

	describe(`${Routes.GROUPS} (POST)`, () => {
		let fakeGroupDto: CreateGroupDto;

		beforeEach(() => {
			mockGroupRepository.create = jest.fn();
			mockGroupRepository.save = jest.fn();
			mockUserRepository.find = jest.fn();

			fakeGroupDto = {
				name: faker.company.name(),
				userIds: faker.helpers.multiple(
					faker.number.int.bind(faker.number, { min: 1, max: 255 }),
					{
						count: { min: 1, max: 20 },
					},
				),
			};

			mockGroupRepository.create.mockImplementation((args) =>
				groupMock.create(args),
			);
			mockGroupRepository.save.mockImplementation((args) =>
				groupMock.save(args),
			);
			(In as jest.Mock).mockImplementation((args) => args);
		});

		it('OK 201', async () => {
			mockUserRepository.find.mockImplementation((args) =>
				userMock.find(args),
			);

			return request(app.getHttpServer())
				.post(Routes.GROUPS)
				.send(fakeGroupDto)
				.set('Accept', 'application/json')
				.expect(201)
				.then(({ body }) => {
					expect(body).toEqual(groupMock.saveMethodResult);
				});
		});

		it('Not found 404', async () => {
			mockUserRepository.find.mockResolvedValue([]);

			return request(app.getHttpServer())
				.post(Routes.GROUPS)
				.send(fakeGroupDto)
				.set('Accept', 'application/json')
				.expect(404)
				.then(({ body }) => {
					expect(body.message).toBe('trusted or not found users');
				});
		});
	});

	describe(`${Routes.USERS}/:id AND ${Routes.DOCS}/:id (PUT)`, () => {
		let groupId: number;
		let fakeAddUsersDto: AddUsersDto;
		let fakeAddDocumentsDto: AddDocumentDto;

		beforeEach(() => {
			mockGroupRepository.findOne = jest.fn();
			mockGroupRepository.save = jest.fn();
			mockUserRepository.find = jest.fn();
			mockDocumentRepository.find = jest.fn();

			const ids: number[] = faker.helpers.multiple(
				faker.number.int.bind(faker.number, { min: 1, max: 255 }),
				{
					count: { min: 1, max: 20 },
				},
			);
			groupId = faker.number.int({ min: 1, max: 255 });
			fakeAddUsersDto = {
				userIds: ids,
			};
			fakeAddDocumentsDto = {
				documentIds: ids,
			};

			mockGroupRepository.save.mockImplementation((args) =>
				groupMock.save(args),
			);
		});

		it(`${Routes.USERS}/${groupId} OK 200`, async () => {
			mockGroupRepository.findOne.mockImplementation((args) =>
				groupMock.findOne(args),
			);
			mockUserRepository.find.mockImplementation((args) =>
				userMock.find(args),
			);

			return request(app.getHttpServer())
				.put(`${Routes.USERS}/${groupId}`)
				.send(fakeAddUsersDto)
				.set('Accept', 'application/json')
				.expect(200)
				.then(({ body }) => {
					expect(body).toEqual(groupMock.saveMethodResult);
				});
		});

		it(`${Routes.USERS}/${groupId} Not found 404`, async () => {
			mockGroupRepository.findOne.mockResolvedValue(undefined);

			return request(app.getHttpServer())
				.put(`${Routes.USERS}/${groupId}`)
				.send(fakeAddUsersDto)
				.set('Accept', 'application/json')
				.expect(404)
				.then(({ body }) => {
					expect(body.message).toBe(`Group #${groupId} not found`);
				});
		});

		it(`${Routes.USERS}/${groupId} Not found 404`, async () => {
			mockGroupRepository.findOne.mockImplementation((args) =>
				groupMock.findOne(args),
			);
			mockUserRepository.find.mockResolvedValue([]);

			return request(app.getHttpServer())
				.put(`${Routes.USERS}/${groupId}`)
				.send(fakeAddUsersDto)
				.set('Accept', 'application/json')
				.expect(404)
				.then(({ body }) => {
					expect(body.message).toBe('trusted or not found users');
				});
		});

		it(`${Routes.DOCS}/${groupId} OK 200`, async () => {
			mockGroupRepository.findOne.mockImplementation((args) =>
				groupMock.findOne(args),
			);
			mockDocumentRepository.find.mockImplementation((args) =>
				documentMock.find(args),
			);

			return request(app.getHttpServer())
				.put(`${Routes.DOCS}/${groupId}`)
				.send(fakeAddDocumentsDto)
				.set('Accept', 'application/json')
				.expect(200)
				.then(({ body }) => {
					expect(body).toEqual(groupMock.saveMethodResult);
				});
		});

		it(`${Routes.DOCS}/${groupId} Not found 404`, async () => {
			mockGroupRepository.findOne.mockResolvedValue(undefined);

			return request(app.getHttpServer())
				.put(`${Routes.DOCS}/${groupId}`)
				.send(fakeAddDocumentsDto)
				.set('Accept', 'application/json')
				.expect(404)
				.then(({ body }) => {
					expect(body.message).toBe(`Group #${groupId} not found`);
				});
		});

		it(`${Routes.DOCS}/${groupId} Not found 404`, async () => {
			mockGroupRepository.findOne.mockImplementation((args) =>
				groupMock.findOne(args),
			);
			mockDocumentRepository.find.mockResolvedValue([]);

			return request(app.getHttpServer())
				.put(`${Routes.DOCS}/${groupId}`)
				.send(fakeAddDocumentsDto)
				.set('Accept', 'application/json')
				.expect(404)
				.then(({ body }) => {
					expect(body.message).toBe('trusted or not found documents');
				});
		});
	});
});
