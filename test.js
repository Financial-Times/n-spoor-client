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

	afterEach(() => nock.cleanAll());

	it('should send an event to Spoor', () => {
		const scope = nock('https://spoor-api.ft.com/')
		.post('/ingest')
		.reply(202, {});

		const client = new SpoorClient({
			source: 'spoor-client',
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

	it('should send an event to Spoor using cookie header from Varnish', () => {
		const scope = nock('https://spoor-api.ft.com/', {
			reqheaders: {
				Cookie: 'original cookie val; spoor-id=12345;',
				'User-Agent': 'original ua val',
				'spoor-device-id': '12345',
			},
		})
		.post('/ingest')
		.reply(202, {});

		const client = new SpoorClient({
			source: 'spoor-client',
			category: 'test',
			req: fakeRequest({
				'ft-cookie-original': 'original cookie val; spoor-id=12345;',
				'user-agent': 'original ua val',
			}),
		});

		return client.submit({
			action: 'test',
			context: {},
		}).then(() => {
			console.assert(scope.isDone(), 'should have sent event');
		});
	});

	it('should send an event to Spoor using explicit cookies and ua values', () => {
		const scope = nock('https://spoor-api.ft.com/', {
			reqheaders: {
				Cookie: 'original cookie val; spoor-id=12345;',
				'User-Agent': 'original ua val',
				'spoor-device-id': '12345',
			},
		})
		.post('/ingest')
		.reply(202, {});

		const client = new SpoorClient({
			source: 'spoor-client',
			category: 'test',
			cookies: 'original cookie val; spoor-id=12345;',
			ua: 'original ua val',
		});

		return client.submit({
			action: 'test',
			context: {},
		}).then(() => {
			console.assert(scope.isDone(), 'should have sent event');
		});
	});
});
