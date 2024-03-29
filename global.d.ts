declare namespace Express {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Request {
		isAPIRequest?: boolean;
		tokenRedirect?: string;
		user?: string;
		session: {
			next?: string;
			token?: {
				isInterstitial?: boolean;
				create?: boolean;
				redirect?: string;
			};
		};
	}
}
