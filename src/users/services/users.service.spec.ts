import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserMock } from '../mocks/user.mock';
import { faker } from '@faker-js/faker';
import { CreateUserDto } from '../dtos/user.dto';
import { In } from 'typeorm';
import { MockRepository } from '../../interfaces/mock-repository.interface';

jest.mock('typeorm', () => {
	const originalModule = jest.requireActual('typeorm');

	return {
		__esModule: true,
		...originalModule,
		In: jest.fn(),
	};
});

describe('UsersService', () => {
	let service: UsersService;
	const mockUserRepository = {} as MockRepository;
	let userMock: UserMock;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepository,
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
		userMock = new UserMock();
	});

	describe('Test list method', () => {
		beforeEach(() => {
			mockUserRepository.find = jest.fn();
			mockUserRepository.find.mockImplementation((args) =>
				userMock.find(args),
			);
		});

		it('It should return a users array', async () => {
			const users = await service.list();

			expect(users).toEqual(userMock.findMethodResult);
			expect(mockUserRepository.find).toHaveBeenCalled();
			expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
		});
	});

	describe('Test findByIds method', () => {
		let ids: number[];
		beforeEach(() => {
			mockUserRepository.find = jest.fn();

			ids = faker.helpers.multiple(
				faker.number.int.bind(faker.number, { min: 1, max: 255 }),
				{
					count: { min: 1, max: 20 },
				},
			);
			mockUserRepository.find.mockImplementation((args) =>
				userMock.find(args),
			);
			(In as jest.Mock).mockImplementation((args) => args);
		});

		it('It should return an array of users with the same ids', async () => {
			const users = await service.findByIds(ids);

			expect(users).toEqual(userMock.findMethodResult);
			expect(mockUserRepository.find).toHaveBeenCalled();
			expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
		});

		it('It should return an error', () => {
			mockUserRepository.find.mockResolvedValue([]);
			expect(service.findByIds(ids)).rejects.toThrow(
				'trusted or not found users',
			);
		});
	});

	describe('Test findUserById method', () => {
		let id: number;

		beforeEach(() => {
			mockUserRepository.findOne = jest.fn();
			id = faker.number.int({ min: 1, max: 255 });
			mockUserRepository.findOne.mockImplementation((args) =>
				userMock.findOne(args),
			);
		});

		it('It should return a user with the same id', async () => {
			const user = await service.findUserById(id);

			expect(user).toEqual(userMock.findOneMethodResult);
			expect(mockUserRepository.findOne).toHaveBeenCalled();
			expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
		});
	});

	describe('Test findUserByEmail method', () => {
		let email: string;

		beforeEach(() => {
			mockUserRepository.findOne = jest.fn();
			email = faker.internet.email();
			mockUserRepository.findOne.mockImplementation((args) =>
				userMock.findOne(args),
			);
		});

		it('It should return a user with the same email', async () => {
			const user = await service.findUserByEmail(email);

			expect(user).toEqual(userMock.findOneMethodResult);
			expect(mockUserRepository.findOne).toHaveBeenCalled();
			expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
		});
	});

	describe('Test create method', () => {
		let fakeUserDto: CreateUserDto;

		beforeEach(() => {
			mockUserRepository.create = jest.fn();
			mockUserRepository.save = jest.fn();
			const fakeUser = userMock.generateUser();
			fakeUserDto = {
				password: fakeUser.password,
				email: fakeUser.email,
				publicKey: fakeUser.publicKey,
				firstName: fakeUser.firstName,
				lastName: fakeUser.lastName,
			};
			mockUserRepository.create.mockImplementation((args) =>
				userMock.create(args),
			);
			mockUserRepository.save.mockImplementation((args) =>
				userMock.save(args),
			);
		});

		it('It should return a new user', async () => {
			const newUser = await service.create(fakeUserDto);

			expect(newUser).toEqual(userMock.saveMethodResult);
			expect(mockUserRepository.create).toHaveBeenCalled();
			expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.save).toHaveBeenCalled();
			expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
		});
	});
});
