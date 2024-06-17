import {type Request} from 'express';

type MaybeUser = {
	user: string | string[];
	authenticated: boolean;
} | undefined | null; // eslint-disable-line @typescript-eslint/ban-types

export type UserFromRequestFunction = (request: Request) => MaybeUser | Promise<MaybeUser>;
