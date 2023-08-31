import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

const fileTypeFromFile = (value: string) => {
	const arrayValue = Array.from(value).reverse();
	const i = arrayValue.findIndex((v) => v === '.');
	return arrayValue.slice(0, i).reverse().join('');
};

export const generateStorage = (destination: string) => {
	const storage = diskStorage({
		destination,
		filename: (req, file, cb) => {
			const extension = fileTypeFromFile(file.originalname);
			cb(null, `${uuidv4()}.${extension}`);
		},
	});

	return storage;
};
