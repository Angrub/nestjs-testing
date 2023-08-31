import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/user.dto';

@Injectable()
export class UsersService {
	constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

	async list() {
		return await this.userRepo.find();
	}

	async findByIds(ids: number[]) {
		const users = await this.userRepo.find({
			where: { id: In(ids) },
		});

		if (users.length !== ids.length)
			throw new NotFoundException('trusted or not found users');

		return users;
	}

	async findUserById(id: number) {
		return await this.userRepo.findOne({
			where: { id },
		});
	}

	async findUserByEmail(email: string) {
		return await this.userRepo.findOne({
			where: { email },
		});
	}

	async create(data: CreateUserDto) {
		const newUser = this.userRepo.create(data);
		return this.userRepo.save(newUser);
	}
}
