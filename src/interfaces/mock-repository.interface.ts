export interface MockRepository {
	find: jest.Mock;
	findOne: jest.Mock;
	create: jest.Mock;
	save: jest.Mock;
}
