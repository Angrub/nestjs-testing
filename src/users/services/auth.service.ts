import {
	BadRequestException,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, PayloadToken, RegisterDto } from '../dtos/auth.dto';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { config } from 'src/config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		@Inject(config.KEY) private configService: ConfigType<typeof config>,
	) {}

	generateJWT(user: User) {
		const payload: PayloadToken = { sub: user.id };
		return this.jwtService.sign(payload);
	}

	async register(data: RegisterDto) {
		const user = await this.usersService.findUserByEmail(data.email);
		if (user) throw new BadRequestException('User already exists');

		const password = await bcrypt.hash(data.password, 10);
		const newUser = await this.usersService.create({
			...data,
			password,
		});

		const access_token = this.generateJWT(newUser);
		return {
			user: newUser,
			cookie: `Authentication=${access_token}; HttpOnly; Path=/; Max-Age=${this.configService.expiresIn}`,
		};
	}

	async login(data: LoginDto) {
		const user = await this.usersService.findUserByEmail(data.email);
		if (!user)
			throw new UnauthorizedException('Email or password are wrong');
		const isMatch = await bcrypt.compare(data.password, user.password);
		if (!isMatch)
			throw new UnauthorizedException(`Email or password are wrong`);

		const access_token = this.generateJWT(user);
		return {
			user,
			cookie: `Authentication=${access_token}; HttpOnly; Path=/; Max-Age=${this.configService.expiresIn}`,
		};
	}
}
