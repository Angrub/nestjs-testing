import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { AuthController } from './controllers/auth.controller';
import { UsersService } from './services/users.service';
import { AuthService } from './services/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { config } from 'src/config';
import { ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		PassportModule,
		JwtModule.registerAsync({
			inject: [config.KEY],
			useFactory: async (configService: ConfigType<typeof config>) => ({
				secret: configService.jwtSecret,
				signOptions: {
					expiresIn: configService.expiresIn,
				},
			}),
		}),
	],
	controllers: [UsersController, AuthController],
	providers: [UsersService, AuthService, JwtStrategy],
	exports: [UsersService],
})
export class UsersModule {}
