import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtGuard } from '../guards/jwt.guard';

// @UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
	constructor(private usersServices: UsersService) {}

	@Get('/')
	list() {
		return this.usersServices.list();
	}
}
