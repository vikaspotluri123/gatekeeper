// With "HEAD" requests we get the url from the `x-original-uri` header
export function updateRequestParameters(req, _, next) {
	req.params = req.params || {};
	req.params.url = req.headers['x-original-uri'];
	next();
}
