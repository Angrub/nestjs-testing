import { faker } from '@faker-js/faker';
import { User } from '../entities/user.entity';
import { DeepPartial } from 'typeorm';

export class UserMock {
	private _findMethodResult: User[];
	private _findOneMethodResult: User;
	public createMethodResult: User;
	private _saveMethodResult: User;
	private omitPipe: boolean;

	constructor(omitPipe = false) {
		this.omitPipe = omitPipe;
	}

	generateUser(data?: GenerateUserParams) {
		// create
		const user = new User();

		if (data) {
			user.id = data.id;
			user.password = data.password;
			user.email = data.email;
			user.publicKey = data.publicKey;
			user.firstName = data.firstName;
			user.lastName = data.lastName;
		}
		// generate
		user.id = user.id ?? faker.number.int({ min: 0, max: 255 });
		user.password =
			user.password ?? faker.internet.password({ length: 40 });
		user.email = user.email ?? faker.internet.exampleEmail();
		user.publicKey =
			user.publicKey ??
			faker.string.alphanumeric({
				length: { min: 200, max: 255 },
			});
		user.firstName = user.firstName ?? faker.person.firstName();
		user.lastName = user.lastName ?? faker.person.lastName();
		user.createdAt = faker.date.anytime();
		user.updatedAt = faker.date.anytime();

		// return
		return user;
	}

	find(options?: FindOptions) {
		let users: User[] = [];
		if (options) {
			const ids = options.where.id;
			ids.forEach((id) => users.push(this.generateUser({ id })));
		} else {
			users = faker.helpers.multiple(this.generateUser, {
				count: { min: 0, max: 1 },
			});
		}

		this._findMethodResult = users.map((user) => ({ ...user }));
		return Promise.resolve(users);
	}

	findOne(options: FindOneOptions) {
		let user: User;
		if (options.where.id) {
			user = this.generateUser({ id: options.where.id });
		} else {
			user = this.generateUser({ email: options.where.email });
		}

		this._findOneMethodResult = { ...user };
		return Promise.resolve(user);
	}

	create(enityLike: DeepPartial<User>) {
		const user = new User();
		user.password = enityLike.password;
		user.email = enityLike.email;
		user.publicKey = enityLike.publicKey;
		user.firstName = enityLike.firstName;
		user.lastName = enityLike.lastName;
		this.createMethodResult = { ...user };

		return user;
	}

	save(entity: User) {
		entity.id = faker.number.int({ min: 0, max: 255 });
		entity.createdAt = faker.date.anytime();
		entity.updatedAt = faker.date.anytime();
		this._saveMethodResult = { ...entity };

		return Promise.resolve(entity);
	}

	get findMethodResult() {
		if (this.omitPipe && this._findMethodResult) {
			const value = this._findMethodResult.map((user) => {
				delete user.createdAt;
				delete user.updatedAt;
				delete user.password;

				return user;
			});
			return value;
		}

		return this._findMethodResult;
	}

	get findOneMethodResult() {
		if (this.omitPipe && this._findOneMethodResult) {
			const value = { ...this._findOneMethodResult };
			delete value.createdAt;
			delete value.updatedAt;
			delete value.password;

			return value;
		}

		return this._findOneMethodResult;
	}

	set findOneMethodResult(value) {
		this._findOneMethodResult = value;
	}

	get saveMethodResult() {
		if (this.omitPipe && this._saveMethodResult) {
			const value = { ...this._saveMethodResult };
			delete value.createdAt;
			delete value.updatedAt;
			delete value.password;

			return value;
		}

		return this._saveMethodResult;
	}

}

interface GenerateUserParams {
	id?: number;
	password?: string;
	email?: string;
	publicKey?: string;
	firstName?: string;
	lastName?: string;
}

interface FindOptions {
	where: {
		id: number[];
	};
}

interface FindOneOptions {
	where: {
		id?: number;
		email?: string;
	};
}
