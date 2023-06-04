export {knex} from './knex.js';

export async function setupDb() {
	await import('./init.js');
}
