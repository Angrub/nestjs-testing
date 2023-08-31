import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { UsersService } from '../../users/services/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from '../entities/document.entity';
import { User } from '../../users/entities/user.entity';
import { UserMock } from '../../users/mocks/user.mock';
import { DocumentMock } from '../mocks/document.mock';
import { faker } from '@faker-js/faker';
import { In } from 'typeorm';
import { PayloadToken } from 'src/users/dtos/auth.dto';
import { CreateDocumentDto } from '../dtos/document.dto';
import { StreamableFile } from '@nestjs/common';
import { ReadStream, createReadStream } from 'node:fs';
import { MockRepository } from 'src/interfaces/mock-repository.interface';

jest.mock('typeorm', () => {
	const originalModule = jest.requireActual('typeorm');

	return {
		__esModule: true,
		...originalModule,
		In: jest.fn(),
	};
});

jest.mock('node:fs', () => {
	const originalModule = jest.requireActual('node:fs');

	return {
		__esModule: true,
		...originalModule,
		createReadStream: jest.fn(),
	};
});

describe('DocumentsService', () => {
	let service: DocumentsService;
	const mockDocumentRepository = {} as MockRepository;
	const mockUserRepository = {} as MockRepository;
	let documentMock: DocumentMock;
	let userMock: UserMock;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
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
		}).compile();

		service = module.get<DocumentsService>(DocumentsService);
		documentMock = new DocumentMock();
		userMock = new UserMock();
	});

	describe('Test list method', () => {
		beforeEach(() => {
			mockDocumentRepository.find = jest.fn();
			mockDocumentRepository.find.mockImplementation((args) =>
				documentMock.find(args),
			);
		});

		it('It should return a documents array', async () => {
			const documents = await service.list();

			expect(documents).toEqual(documentMock.findMethodResult);
			expect(mockDocumentRepository.find).toHaveBeenCalled();
			expect(mockDocumentRepository.find).toHaveBeenCalledTimes(1);
		});
	});

	describe('Test findByFilename method', () => {
		let filename: string;

		beforeEach(() => {
			mockDocumentRepository.findOne = jest.fn();
			filename = faker.system.fileName();
			mockDocumentRepository.findOne.mockImplementation((args) =>
				documentMock.findOne(args),
			);
		});

		it('It should return a user with the same id', async () => {
			const document = await service.findByFilename(filename);

			expect(document).toEqual(documentMock.findOneMethodResult);
			expect(mockDocumentRepository.findOne).toHaveBeenCalled();
			expect(mockDocumentRepository.findOne).toHaveBeenCalledTimes(1);
		});

		it('It should return an error', () => {
			mockDocumentRepository.findOne.mockResolvedValue(undefined);

			expect(service.findByFilename(filename)).rejects.toThrow(
				`Not found file ${filename}`,
			);
		});
	});

	describe('Test findByIds method', () => {
		let ids: number[];
		beforeEach(() => {
			mockDocumentRepository.find = jest.fn();

			ids = faker.helpers.multiple(
				faker.number.int.bind(faker.number, { min: 1, max: 255 }),
				{
					count: { min: 1, max: 20 },
				},
			);
			mockDocumentRepository.find.mockImplementation((args) =>
				documentMock.find(args),
			);
			(In as jest.Mock).mockImplementation((args) => args);
		});

		it('It should return an array of documents with the same ids', async () => {
			const documents = await service.findByIds(ids);

			expect(documents).toEqual(documentMock.findMethodResult);
			expect(mockDocumentRepository.find).toHaveBeenCalled();
			expect(mockDocumentRepository.find).toHaveBeenCalledTimes(1);
		});

		it('It should return an error', () => {
			mockDocumentRepository.find.mockResolvedValue([]);
			expect(service.findByIds(ids)).rejects.toThrow(
				'trusted or not found documents',
			);
		});
	});

	describe('Test create method', () => {
		let token: PayloadToken;
		let document: Express.Multer.File;
		let fakeDocumentDto: CreateDocumentDto;

		beforeEach(() => {
			mockDocumentRepository.create = jest.fn();
			mockDocumentRepository.save = jest.fn();
			mockUserRepository.findOne = jest.fn();

			const fakeDocument = documentMock.generateDocument();
			token = { sub: faker.number.int({ min: 1, max: 255 }) };
			document = {
				filename: fakeDocument.filename,
				originalname: fakeDocument.originalname,
			} as Express.Multer.File;
			fakeDocumentDto = {
				digitalSignature: fakeDocument.digitalSignature,
			};

			mockDocumentRepository.create.mockImplementation((args) =>
				documentMock.create(args),
			);
			mockDocumentRepository.save.mockImplementation((args) =>
				documentMock.save(args),
			);
			mockUserRepository.findOne.mockImplementation((args) =>
				userMock.findOne(args),
			);
		});

		it('It should return a new document', async () => {
			const newDocument = await service.create(
				token,
				document,
				fakeDocumentDto,
			);

			expect(newDocument).toEqual(documentMock.saveMethodResult);
			expect(mockDocumentRepository.create).toHaveBeenCalled();
			expect(mockDocumentRepository.create).toHaveBeenCalledTimes(1);
			expect(mockDocumentRepository.save).toHaveBeenCalled();
			expect(mockDocumentRepository.save).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.findOne).toHaveBeenCalled();
			expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
		});
	});

	describe('Test getUserDocuments method', () => {
		let token: PayloadToken;

		beforeEach(() => {
			mockDocumentRepository.find = jest.fn();

			token = { sub: faker.number.int({ min: 1, max: 255 }) };

			mockDocumentRepository.find.mockImplementation((args) =>
				documentMock.find(args),
			);
		});

		it('It should return a documents array', async () => {
			const documents = await service.getUserDocuments(token);

			expect(documents).toEqual(documentMock.findMethodResult);
			expect(mockDocumentRepository.find).toHaveBeenCalled();
			expect(mockDocumentRepository.find).toHaveBeenCalledTimes(1);
		});
	});

	describe('Test downloadDocument method', () => {
		let filename: string;

		beforeEach(() => {
			mockDocumentRepository.findOne = jest.fn();
			filename = faker.system.fileName();
			mockDocumentRepository.findOne.mockImplementation((args) =>
				documentMock.findOne(args),
			);
			(createReadStream as jest.Mock).mockImplementation(
				() => ({} as ReadStream),
			);
		});

		it('It should return a StreamableFile', async () => {
			const stream = await service.downloadDocument(filename);

			expect(stream instanceof StreamableFile).toEqual(true);
			expect(mockDocumentRepository.findOne).toHaveBeenCalled();
			expect(mockDocumentRepository.findOne).toHaveBeenCalledTimes(1);
		});
	});
});
