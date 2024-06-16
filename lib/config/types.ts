import {type Request} from 'express';

export type UserFromRequestFunction = (request: Request) => {user: string | string[]; authenticated: boolean};
