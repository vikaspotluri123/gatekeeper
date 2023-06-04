import path from 'node:path';
import process from 'node:process';
import {writeFileSync, readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';

const SECRET_FILE_NAME = path.resolve(process.cwd(), '.gkrnd');

let secret;

// @NOTE: this operation is not async because it should only happen once (on bootup)
function createSecret() {
	const createdSecret = randomBytes(16).toString('hex');
	writeFileSync(SECRET_FILE_NAME, createdSecret);
	secret = createdSecret;
	return secret;
}

export function getSecret() {
	if (secret) {
		return secret;
	}

	// @NOTE: this operation is not async because it should only happen once (on bootup)
	let existingSecret;
	try {
		existingSecret = readFileSync(SECRET_FILE_NAME, 'utf8');
	} catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}

		existingSecret = false;
	}

	if (existingSecret) {
		secret = existingSecret;
		return secret;
	}

	return createSecret();
}
