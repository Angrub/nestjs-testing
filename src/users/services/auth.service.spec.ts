import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserMock } from '../mocks/user.mock';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { compare, hash } from 'bcrypt';
import { MockRepository } from '../../interfaces/mock-repository.interface';

export interface MockJwtService {
	sign: jest.Mock;
}

describe('AuthService', () => {
	let service: AuthService;
	let userMock: UserMock;
	const mockUserRepository = {} as MockRepository;
	const mockJwtService = {} as MockJwtService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
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

		service = module.get<AuthService>(AuthService);
		userMock = new UserMock();
	});

	describe('Test generateJWT method', () => {
		let fakeUser: User;
		let jwtToken: string;

		beforeEach(() => {
			mockJwtService.sign = jest.fn();
			fakeUser = userMock.generateUser();
			jwtToken = JSON.stringify(fakeUser);
			mockJwtService.sign.mockReturnValue(jwtToken);
		});

		it('It should return a token', () => {
			const token = service.generateJWT(fakeUser);

			expect(token).toBe(jwtToken);
			expect(mockJwtService.sign).toHaveBeenCalled();
			expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
		});
	});

	describe('Test register method', () => {
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

		it('It should return a token and a user', async () => {
			// individual implementation
			mockUserRepository.findOne.mockResolvedValue(undefined);

			const successAuth = await service.register(fakeRegisterDto);
			const isMatch = await compare(
				fakeRegisterDto.password,
				successAuth.user.password,
			);
			expect(successAuth).toEqual({
				access_token: jwtToken,
				user: userMock.saveMethodResult,
			});
			expect(isMatch).toEqual(true);
			expect(mockUserRepository.findOne).toHaveBeenCalled();
			expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.create).toHaveBeenCalled();
			expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.save).toHaveBeenCalled();
			expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
			expect(mockJwtService.sign).toHaveBeenCalled();
			expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
		});

		it('It should return an error', async () => {
			// individual implementation
			mockUserRepository.findOne.mockImplementation((args) =>
				userMock.findOne(args),
			);

			await expect(service.register(fakeRegisterDto)).rejects.toThrow(
				'User already exists',
			);
			expect(mockUserRepository.findOne).toHaveBeenCalled();
			expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.create).not.toHaveBeenCalled();
			expect(mockUserRepository.save).not.toHaveBeenCalled();
			expect(mockJwtService.sign).not.toHaveBeenCalled();
		});
	});

	describe('Test login method', () => {
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

		it('It should return a token and a user', async () => {
			// individual implementation
			mockUserRepository.findOne.mockImplementation(async (args) => {
				const user = await userMock.findOne(args);
				user.password = await hash(fakeLoginDto.password, 10);
				userMock.findOneMethodResult = { ...user };
				return user;
			});

			const successAuth = await service.login(fakeLoginDto);

			expect(successAuth).toEqual({
				access_token: jwtToken,
				user: userMock.findOneMethodResult,
			});
			expect(mockUserRepository.findOne).toHaveBeenCalled();
			expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
		});

		it('It should return an error: User not found', async () => {
			// individual implementation
			mockUserRepository.findOne.mockResolvedValue(undefined);

			await expect(service.login(fakeLoginDto)).rejects.toThrow(
				'Email or password are wrong',
			);
			expect(mockUserRepository.findOne).toHaveBeenCalled();
			expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
			expect(mockJwtService.sign).not.toHaveBeenCalled();
		});

		it('It should return an error: Password wrong', async () => {
			// individual implementation
			mockUserRepository.findOne.mockImplementation(async (args) => {
				const user = await userMock.findOne(args);
				user.password += fakeLoginDto.password;
				user.password = await hash(user.password + '123', 10);
				userMock.findOneMethodResult = { ...user };
				return user;
			});

			await expect(service.login(fakeLoginDto)).rejects.toThrow(
				'Email or password are wrong',
			);
			expect(mockUserRepository.findOne).toHaveBeenCalled();
			expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
			expect(mockJwtService.sign).not.toHaveBeenCalled();
		});
	});
});
