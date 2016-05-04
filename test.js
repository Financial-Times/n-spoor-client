import nock from 'nock';
import SpoorClient from './';
import logger from '@financial-times/n-logger';

logger.removeConsole();

const fakeRequest = (headers) => ({
	get(k) {
		return headers[k];
	}
});

describe('Spoor client', () => {
	it('should send an event to Spoor', () => {
		const scope = nock('https://spoor-api.ft.com/')
		.post('/ingest')
		.reply(202, {});

		const client = new SpoorClient({
			source: 'n-spoor-client',
			category: 'test',
			req: fakeRequest({}),
		});

		return client.submit({
			action: 'test',
			context: {},
		}).then(() => {
			console.assert(scope.isDone(), 'should have sent event');
		});
	});
});
