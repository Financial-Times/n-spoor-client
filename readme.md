n-spoor-client [![Build Status](https://travis-ci.org/Financial-Times/n-spoor-client.svg?branch=master)](https://travis-ci.org/Financial-Times/n-spoor-client)
==============

Node client to send events to [Spoor](https://spoor-docs.herokuapp.com/)

```shell
npm install -S @financial-times/n-spoor-client
```

Usage
-----

```js
import SpoorClient from '@financial-times/n-spoor-client';

function expressRoute(req, res) {
  const spoor = new SpoorClient({req});
  spoor.submit({
    category: 'foo-bar',
    action: 'baz',
    context: {
      quux: 'frob'
    }
  }).then(
    () => console.log('event successfully logged'),
    ({payload, status, request}) => console.log(`submission failed, status ${status}`)
  );
}
```

API
---

### `new SpoorClient(options)`

Initialize a Spoor client with options:

| Option       | Description                                                                            |
|--------------|----------------------------------------------------------------------------------------|
| `req`        | The default Express request for all events. *Required in constructor or `submit`*.     |
| `source`     | String to tell Spoor where the event came from. *Required in constructor or `submit`*. |
| `category`   | String for Spoor event categorisation. *Required in constructor or `submit`*.          |
| `apiKey`     | Defaults to `process.env.SPOOR_API_KEY`                                                |
| `submitIf`   | Boolean. If false, the client will not submit events.                                  |
| `inTestMode` | Boolean. Sets a context flag to tell Spoor the event is a test event.                  |

### `client.submit(event)`

Send an event to Spoor. Returns a promise which resolves when the event is successfully sent to Spoor, or rejects with a status object when submission fails. The event should be an object with keys:

| Option       | Description                                                                            |
|--------------|----------------------------------------------------------------------------------------|
| `req`        | The default Express request for all events. *Required in constructor or `submit`*.     |
| `source`     | String to tell Spoor where the event came from. *Required in constructor or `submit`*. |
| `category`   | String for Spoor event categorisation. *Required in constructor or `submit`*.          |
| `action`     | String name of the event action.                                                       |
| `context`    | Object containing metadata pertaining to the event. *Required*.                        |
| `apiKey`     | Defaults to `process.env.SPOOR_API_KEY`                                                |

---

Originally part of [next-signup](https://github.com/Financial-Times/next-signup).
