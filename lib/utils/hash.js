const crypto = require('crypto');

module.exports = function sha256Hash(data) {
	return crypto.createHash('sha256').update(data).digest('base64')
}
