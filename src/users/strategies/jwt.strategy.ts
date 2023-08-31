import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'src/config';
import { PayloadToken } from '../dtos/auth.dto';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		@Inject(config.KEY) private configService: ConfigType<typeof config>,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					return request?.cookies?.Authentication;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: configService.jwtSecret,
		});
	}

	validate(payload: PayloadToken) {
		return payload;
	}
}
