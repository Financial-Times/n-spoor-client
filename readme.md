n-spoor-client
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
  });
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

Send an event to Spoor. The event should be an object with keys:

| Option       | Description                                                                            |
|--------------|----------------------------------------------------------------------------------------|
| `req`        | The default Express request for all events. *Required in constructor or `submit`*.     |
| `source`     | String to tell Spoor where the event came from. *Required in constructor or `submit`*. |
| `category`   | String for Spoor event categorisation. *Required in constructor or `submit`*.          |
| `action`     | String name of the event action.                                                       |
| `context`    | Object containing metadata pertaining to the event.                                    |
| `apiKey`     | Defaults to `process.env.SPOOR_API_KEY`                                                |

Credits
-------

Written by Ifeanyi Isitor (@ifyio) at Financial Times. Originally part of [next-signup](https://github.com/Financial-Times/next-signup).
