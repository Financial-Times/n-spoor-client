import fetch from 'node-fetch';
import logger from '@financial-times/n-logger';

const userIdPattern = /spoor-id=([^;]*)/;
const extractSpoorId = (cookie) => {
	const matches = userIdPattern.exec(cookie) || [];
	return matches[1];
}

export default class SpoorClient {

	constructor ({
		source,
		category,
		req = null,
		cookies = null,
		ua = null,
		product = 'next',
		submitIf = true,
		inTestMode = false,
		deviceId = null,
		apiKey = process.env.SPOOR_API_KEY
	} = {}) {
		this.source = source;
		this.category = category;
		this.product = product;
		this.req = req;
		this.cookies = cookies;
		this.ua = ua;
		this.shouldSubmitEvent = submitIf;
		this.apiKey = apiKey;
		this.inTestMode = inTestMode;
		this.deviceId = deviceId;
	}

	submit ({
		source = this.source,
		category = this.category,
		req = this.req,
		cookies = this.cookies,
		ua = this.ua,
		apiKey = this.apiKey,
		product = this.product,
		deviceId = this.deviceId,
		action,
		context
	} = {}) {

		cookies = cookies || (req && req.get('ft-cookie-original'));
		ua = ua || (req && req.get('user-agent'));
		deviceId = deviceId || extractSpoorId(cookies);

		logger.info('spoor -> will send event? ->', JSON.stringify({
			category,
			action,
			willSendEvent: this.shouldSubmitEvent,
			inTestMode: this.inTestMode
		}));

		if(this.shouldSubmitEvent) {
			context.product = context.product || product;
			context.isTestEvent = this.inTestMode;

			const the = {
				status: undefined,
				summary: {
					source,
					category,
					action,
					context
				},
				data: {
					system: {
						api_key: apiKey,
						version: '1.0.0',
						source: source
					},
					context: context,
					category: category,
					action: action
				},
				deviceId,
			};

			logger.info('spoor -> about to send event ->', JSON.stringify(the));

			return fetch('https://spoor-api.ft.com/ingest', {
				method: 'post',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Cookie': cookies,
					'User-Agent': ua,
					'Content-Length': new Buffer(JSON.stringify(the.data)).length,
					'spoor-id': deviceId
				},
				body: JSON.stringify(the.data)
			})
			.then(response => {
				logger.info('spoor -> response status ->', response.status);
				the.status = response.status;
				return response.json();
			})
			.then(payload => {
				const info = {
					payload,
					status: the.status,
					request: the.summary
				};

				logger.info('spoor -> response ->', info);

				if(the.status !== 202) {
					return Promise.reject(info);
				}
			})
			.catch(err => {
				logger.error(`spoor -> api error (${action}) -> `, err);
				return Promise.reject(err);
			});
		}

		return Promise.resolve();
	}
}
