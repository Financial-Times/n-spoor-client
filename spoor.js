import logger from '@financial-times/n-logger';
import raven from '@financial-times/n-raven';

export default class SpoorApi {

	constructor ({
		req,
		source='next-signup',
		category='signup',
		submitIf=true,
		inTestMode=false,
		apiKey=process.env.SPOOR_API_KEY
	}={}) {
		this.source = source;
		this.category = category;
		this.req = req;
		this.shouldSubmitEvent = submitIf;
		this.apiKey = apiKey;
		this.inTestMode = inTestMode;
	}

	submit ({source=this.source, category=this.category, req=this.req, apiKey=this.apiKey, action, context}={}) {

		logger.info('spoor -> will send event? ->', JSON.stringify({
			category,
			action,
			willSendEvent: this.shouldSubmitEvent,
			inTestMode: this.inTestMode
		}));

		if(this.shouldSubmitEvent) {
			context.product = 'next';
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
				}
			};

			logger.info('spoor -> about to send event ->', JSON.stringify(the.data));
			logger.info('spoor -> about to send event ->', the.summary);

			return fetch('https://spoor-api.ft.com/ingest', {
				method: 'post',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Cookie': req.get('cookie'),
					'User-Agent': req.get('user-agent'),
					'Content-Length': new Buffer(JSON.stringify(the.data)).length
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
				raven.captureError(err);
			});
		}
	}
}
