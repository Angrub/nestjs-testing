import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
	constructor(private authServices: AuthService) {}

	@Post('/login')
	@HttpCode(200)
	async login(@Res() response: Response, @Body() data: LoginDto) {
		const successAuth = await this.authServices.login(data);
		response.setHeader('Set-Cookie', successAuth.cookie);
		return successAuth.user;
	}

	@Post('/register')
	async register(@Res() response: Response, @Body() data: RegisterDto) {
		const successAuth = await this.authServices.register(data);
		response.setHeader('Set-Cookie', successAuth.cookie);
		return successAuth.user;
	}
}
