import { NotFoundException } from '@nestjs/common';

export const httpErrors = {
	notFoundError: (entity: string, entity_id: number | number[]) => {
		const message = Array.isArray(entity_id)
			? `${entity} not found in the list or cloned entity`
			: `${entity} #${entity_id} not found`;

		return new NotFoundException(message);
	},
};
