import { Reflector } from '@nestjs/core';
import { JwtGuard } from './jwt.guard';

describe('JwtGuard', () => {
	it('should be defined', () => {
		expect(new JwtGuard(new Reflector())).toBeDefined();
	});
});
