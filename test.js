import nock from 'nock';
import SpoorClient from './';
import logger from '@financial-times/n-logger';

logger.removeConsole();

const fakeRequest = (headers, ip = null) => ({
	get(k) {
		return headers[k];
	},
	ip
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
				'spoor-id': '12345',
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
				'spoor-id': '12345',
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

	it('should send an event to Spoor using explicit device id', () => {
		const scope = nock('https://spoor-api.ft.com/', {
			reqheaders: {
				'spoor-id': '12345',
			},
		})
		.post('/ingest')
		.reply(202, {});

		const client = new SpoorClient({
			source: 'spoor-client',
			category: 'test',
			deviceId: '12345',
		});

		return client.submit({
			action: 'test',
			context: {},
		}).then(() => {
			console.assert(scope.isDone(), 'should have sent event');
		});
	});

	it('should send an event to Spoor using a header-provided device id', () => {
		const fakeSpoorId = 'abcdef12456790';
		const scope = nock('https://spoor-api.ft.com/', {
			reqheaders: {
				'spoor-id': fakeSpoorId,
			},
		})
		.post('/ingest')
		.reply(202, {});

		const client = new SpoorClient({
			source: 'spoor-client',
			category: 'test',
			req: fakeRequest({
				'FT-Spoor-ID': fakeSpoorId
			}),
		});

		return client.submit({
			action: 'test',
			context: {},
		}).then(() => {
			console.assert(scope.isDone(), 'should have sent event');
		});

	});

	it('should use the client IP from request', () => {
		const scope = nock('https://spoor-api.ft.com/')
		.post('/ingest', {
			device: {
				ip: '1.2.3.4'
			},
		})
		.reply(202, {});

		const client = new SpoorClient({
			req: fakeRequest({}, '1.2.3.4'),
		});

		return client.submit().then(() => {
			console.assert(scope.isDone(), 'should have sent event');
		});
	});

	it('should use an overridden client IP', () => {
		const scope = nock('https://spoor-api.ft.com/')
		.post('/ingest', {
			device: {
				ip: '2.3.4.5'
			},
		})
		.reply(202, {});

		const client = new SpoorClient({
			ip: '2.3.4.5'
		});

		return client.submit().then(() => {
			console.assert(scope.isDone(), 'should have sent event');
		});
	});

});
