import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { Group } from '../entities/groups.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../../users/services/users.service';
import { DocumentsService } from '../../documents/services/documents.service';
import { Document } from '../../documents/entities/document.entity';
import { User } from '../../users/entities/user.entity';
import { UserMock } from '../../users/mocks/user.mock';
import { DocumentMock } from '../../documents/mocks/document.mock';
import { GroupMock } from '../mocks/group.mock';
import { MockRepository } from '../../interfaces/mock-repository.interface';
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

describe('GroupsService', () => {
	let service: GroupsService;
	const mockGroupRepository = {} as MockRepository;
	const mockUserRepository = {} as MockRepository;
	const mockDocumentRepository = {} as MockRepository;
	let groupMock: GroupMock;
	let userMock: UserMock;
	let documentMock: DocumentMock;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
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
		}).compile();

		service = module.get<GroupsService>(GroupsService);
		groupMock = new GroupMock();
		userMock = new UserMock();
		documentMock = new DocumentMock();
	});

	describe('Test list method', () => {
		beforeEach(() => {
			mockGroupRepository.find = jest.fn();
			mockGroupRepository.find.mockImplementation(() => groupMock.find());
		});

		it('It should return a groups array', async () => {
			const groups = await service.list();

			expect(groups).toEqual(groupMock.findMethodResult);
			expect(mockGroupRepository.find).toHaveBeenCalled();
			expect(mockGroupRepository.find).toHaveBeenCalledTimes(1);
		});
	});

	describe('Test findOne, findOneWithUsers and findOneWithDocuments methods', () => {
		let id: number;

		beforeEach(() => {
			mockGroupRepository.findOne = jest.fn();
			id = faker.number.int({ min: 1, max: 255 });
			mockGroupRepository.findOne.mockImplementation((args) =>
				groupMock.findOne(args),
			);
		});

		// findOne method
		it('It should return a user with the same id', async () => {
			const group = await service.findOne(id);

			expect(group).toEqual(groupMock.findOneMethodResult);
			expect(mockGroupRepository.findOne).toHaveBeenCalled();
			expect(mockGroupRepository.findOne).toHaveBeenCalledTimes(1);
		});

		it('It should return an error: "findOne"', () => {
			mockGroupRepository.findOne.mockResolvedValue(undefined);

			expect(service.findOne(id)).rejects.toThrow(
				`Group #${id} not found`,
			);
		});

		// findOneWithUsers method
		it('It should return a user with the same id and the users', async () => {
			const group = await service.findOneWithUsers(id);

			expect(group).toEqual(groupMock.findOneMethodResult);
			expect(mockGroupRepository.findOne).toHaveBeenCalled();
			expect(mockGroupRepository.findOne).toHaveBeenCalledTimes(1);
		});

		it('It should return an error: "findOneWithUsers', () => {
			mockGroupRepository.findOne.mockResolvedValue(undefined);

			expect(service.findOneWithUsers(id)).rejects.toThrow(
				`Group #${id} not found`,
			);
		});

		// findOneWithDocuments method
		it('It should return a user with the same id and the documents', async () => {
			const group = await service.findOneWithDocuments(id);

			expect(group).toEqual(groupMock.findOneMethodResult);
			expect(mockGroupRepository.findOne).toHaveBeenCalled();
			expect(mockGroupRepository.findOne).toHaveBeenCalledTimes(1);
		});

		it('It should return an error: "findOneWithDocuments', () => {
			mockGroupRepository.findOne.mockResolvedValue(undefined);

			expect(service.findOneWithDocuments(id)).rejects.toThrow(
				`Group #${id} not found`,
			);
		});
	});

	describe('Test create method', () => {
		let fakeGroupDto: CreateGroupDto;

		beforeEach(() => {
			mockGroupRepository.create = jest.fn();
			mockGroupRepository.save = jest.fn();
			mockUserRepository.find = jest.fn();

			const fakeGroup = groupMock.generateGroup();
			fakeGroupDto = {
				name: fakeGroup.name,
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
			mockUserRepository.find.mockImplementation((args) =>
				userMock.find(args),
			);
			(In as jest.Mock).mockImplementation((args) => args);
		});

		it('It should return a new group', async () => {
			const newGroup = await service.create(fakeGroupDto);

			expect(newGroup).toEqual(groupMock.saveMethodResult);
			expect(mockGroupRepository.create).toHaveBeenCalled();
			expect(mockGroupRepository.create).toHaveBeenCalledTimes(1);
			expect(mockGroupRepository.save).toHaveBeenCalled();
			expect(mockGroupRepository.save).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.find).toHaveBeenCalled();
			expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
		});

		it('It should return an error', async () => {
			mockUserRepository.find.mockResolvedValue([]);

			await expect(service.create(fakeGroupDto)).rejects.toThrow(
				'trusted or not found users',
			);
			expect(mockGroupRepository.create).not.toHaveBeenCalled();
			expect(mockGroupRepository.save).not.toHaveBeenCalled();
			expect(mockUserRepository.find).toHaveBeenCalled();
			expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
		});
	});

	describe('Test addUsers method', () => {
		let groupId: number;
		let fakeAddUsersDto: AddUsersDto;

		beforeEach(() => {
			mockGroupRepository.findOne = jest.fn();
			mockGroupRepository.save = jest.fn();
			mockUserRepository.find = jest.fn();

			groupId = faker.number.int({ min: 1, max: 255 });
			fakeAddUsersDto = {
				userIds: faker.helpers.multiple(
					faker.number.int.bind(faker.number, { min: 1, max: 255 }),
					{
						count: { min: 1, max: 20 },
					},
				),
			};

			mockGroupRepository.findOne.mockImplementation((args) =>
				groupMock.findOne(args),
			);
			mockGroupRepository.save.mockImplementation((args) =>
				groupMock.save(args),
			);
			mockUserRepository.find.mockImplementation((args) =>
				userMock.find(args),
			);
			(In as jest.Mock).mockImplementation((args) => args);
		});

		it('It should return group with users', async () => {
			const group = await service.addUsers(groupId, fakeAddUsersDto);

			expect(group).toEqual(groupMock.saveMethodResult);
			expect(mockGroupRepository.findOne).toHaveBeenCalled();
			expect(mockGroupRepository.findOne).toHaveBeenCalledTimes(1);
			expect(mockGroupRepository.save).toHaveBeenCalled();
			expect(mockGroupRepository.save).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.find).toHaveBeenCalled();
			expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
		});

		it('It should return an error: findOne method', async () => {
			mockGroupRepository.findOne.mockResolvedValue(undefined);

			await expect(
				service.addUsers(groupId, fakeAddUsersDto),
			).rejects.toThrow(`Group #${groupId} not found`);
			expect(mockGroupRepository.findOne).toHaveBeenCalled();
			expect(mockGroupRepository.findOne).toHaveBeenCalledTimes(1);
			expect(mockGroupRepository.save).not.toHaveBeenCalled();
			expect(mockUserRepository.find).not.toHaveBeenCalled();
		});

		it('It should return an error: findByIds method', async () => {
			mockUserRepository.find.mockResolvedValue([]);

			await expect(
				service.addUsers(groupId, fakeAddUsersDto),
			).rejects.toThrow('trusted or not found users');
			expect(mockGroupRepository.findOne).toHaveBeenCalled();
			expect(mockGroupRepository.findOne).toHaveBeenCalledTimes(1);
			expect(mockGroupRepository.save).not.toHaveBeenCalled();
			expect(mockUserRepository.find).toHaveBeenCalled();
			expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
		});
	});

	describe('Test addDocuments method', () => {
		let groupId: number;
		let fakeAddDocumentsDto: AddDocumentDto;

		beforeEach(() => {
			mockGroupRepository.findOne = jest.fn();
			mockGroupRepository.save = jest.fn();
			mockDocumentRepository.find = jest.fn();

			groupId = faker.number.int({ min: 1, max: 255 });
			fakeAddDocumentsDto = {
				documentIds: faker.helpers.multiple(
					faker.number.int.bind(faker.number, { min: 1, max: 255 }),
					{
						count: { min: 1, max: 20 },
					},
				),
			};

			mockGroupRepository.findOne.mockImplementation((args) =>
				groupMock.findOne(args),
			);
			mockGroupRepository.save.mockImplementation((args) =>
				groupMock.save(args),
			);
			mockDocumentRepository.find.mockImplementation((args) =>
				documentMock.find(args),
			);
			(In as jest.Mock).mockImplementation((args) => args);
		});

		it('It should return group with users', async () => {
			const group = await service.addDocuments(
				groupId,
				fakeAddDocumentsDto,
			);

			expect(group).toEqual(groupMock.saveMethodResult);
			expect(mockGroupRepository.findOne).toHaveBeenCalled();
			expect(mockGroupRepository.findOne).toHaveBeenCalledTimes(1);
			expect(mockGroupRepository.save).toHaveBeenCalled();
			expect(mockGroupRepository.save).toHaveBeenCalledTimes(1);
			expect(mockDocumentRepository.find).toHaveBeenCalled();
			expect(mockDocumentRepository.find).toHaveBeenCalledTimes(1);
		});

		it('It should return an error: findOne method', async () => {
			mockGroupRepository.findOne.mockResolvedValue(undefined);

			await expect(
				service.addDocuments(groupId, fakeAddDocumentsDto),
			).rejects.toThrow(`Group #${groupId} not found`);
			expect(mockGroupRepository.findOne).toHaveBeenCalled();
			expect(mockGroupRepository.findOne).toHaveBeenCalledTimes(1);
			expect(mockGroupRepository.save).not.toHaveBeenCalled();
			expect(mockDocumentRepository.find).not.toHaveBeenCalled();
		});

		it('It should return an error: findByIds method', async () => {
			mockDocumentRepository.find.mockResolvedValue([]);

			await expect(
				service.addDocuments(groupId, fakeAddDocumentsDto),
			).rejects.toThrow('trusted or not found documents');
			expect(mockGroupRepository.findOne).toHaveBeenCalled();
			expect(mockGroupRepository.findOne).toHaveBeenCalledTimes(1);
			expect(mockGroupRepository.save).not.toHaveBeenCalled();
			expect(mockDocumentRepository.find).toHaveBeenCalled();
			expect(mockDocumentRepository.find).toHaveBeenCalledTimes(1);
		});
	});
});
