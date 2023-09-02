export function minifyContent(content) {
	return content.replaceAll(/[\n\t]/g, '');
}
