declare namespace Express {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Request {
		isAPIRequest?: boolean;
		tokenRedirect?: string;
		user?: string;
		// When using `altGetUserFromRequest`, the cookie session might not be loaded
		session?: {
			cookie?: {
				domain: string;
			};
			next?: string;
			token?: {
				isInterstitial?: boolean;
				create?: boolean;
				redirect?: string;
			};
		};
	}
}
