declare namespace Express {
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
			}
		}
	}
}
