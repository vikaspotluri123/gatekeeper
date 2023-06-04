import crypto from 'node:crypto';

export function sha256Hash(data) {
	return crypto.createHash('sha256').update(data).digest('base64');
}
