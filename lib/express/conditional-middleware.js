
/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').Handler} Handler
 */

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').Handler[]} list
 * @param {import('express').NextFunction} callback
 */
function runMiddleware(request, response, list, callback) {
	let index = 0;
	const middlewareSize = list.length;
	function next(error) {
		if (error) {
			callback(error);
			return;
		}

		if (index === middlewareSize) {
			callback();
			return;
		}

		const middleware = list[index++];

		try {
			middleware(request, response, next);
		} catch (error) {
			callback(error);
		}
	}

	next();
}

/**
 * @typedef {(request: Request, response: Response) => boolean | Promise<boolean>} Conditional
 */

/**
 * @param {Conditional} condition
 * @param {Handler | Handler[]} ifTrue
 * @returns {Handler}
 */
export default function conditionalMiddleware(condition, ifTrue) {
	const ifTrueMiddleware = Array.isArray(ifTrue) ? ifTrue : [ifTrue];
	return async (request, response, next) => {
		let conditionResponse;
		try {
			conditionResponse = await condition(request, response);
		} catch (error) {
			next(error);
			return;
		}

		if (conditionResponse) {
			runMiddleware(request, response, ifTrueMiddleware, next);
			return;
		}

		next();
	};
}
