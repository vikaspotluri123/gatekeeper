const {resolve} = require('path');
const {promisify} = require('util');
const {writeFile, readFile} = require('fs');
const {randomBytes} = require('crypto');

const write = promisify(writeFile);
const read = promisify(readFile);

const SECRET_FILE_NAME = resolve(__dirname, '../../.gkrnd');

async function createSecret() {
	const secret = randomBytes(16).toString('hex');
	await write(SECRET_FILE_NAME, secret);
	return secret;
}

module.exports = async function determineSecret() {
	const existingSecret = await read(SECRET_FILE_NAME, 'utf8').catch(error => {
		if (error.code === 'ENOENT') {
			return false;
		}

		throw error;
	});

	if (existingSecret) {
		return existingSecret;
	}

	return createSecret();
};
