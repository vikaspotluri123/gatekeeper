module.exports = function minifyContent(content) {
	return content.replace(/[\n\t]/g, '');
};
