export function ensureArray(input) {
	if (Array.isArray(input)) {
		return input;
	}

	if (input) {
		return [input];
	}

	return [];
}
