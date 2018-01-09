[![NPM](https://nodei.co/npm/node-redis-eventbus.png)](https://npmjs.org/package/node-redis-eventbus)
[<img src="https://yss14.visualstudio.com/_apis/public/build/definitions/c04cf627-33a9-4b7d-920b-a1d2c3867087/1/badge"/>](https://yss14.visualstudio.com/node-redis-eventbus/_build/index?definitionId=1)

# node-redis-eventbus
A simple event bus powered by redis to communicate between multiple node instances.

## Install
```bash
npm install --save node-redis-eventbus

//or

yarn add node-redis-eventbus
```

## Usage
## Async/await pattern
```typescript
//Wrap example by an async function
(async () => {
	//Create new event bus instance with a unique identifier
	const eventBus = await EventBus.create('myEventBus');

	//Add listener and wait until it's binded successfully
	await eventBus.on('msg', (payload) => {
		console.log(`Received message: ${payload}`);

		eventBus.destory();

		process.exit();
	});

	console.log('Listening to msg event');

	setTimeout(() => {
		//Emit event to all listeners on the 'msg' event
		eventBus.emit('msg', 'Hello');
	}, 5000);
})();

//Somewhere else in your code get reference to the event bus
const eventBus = EventBus.getByName('myEventBus');
eventBus.emit('msg', 'Hello?');
```

## Promise style
```typescript
//Create new event bus instance with a unique identifier
EventBus.create('myEventBus').then((eventBus) => {
	//Add listener and wait until it's binded successfully
	eventBus.on('msg', (payload) => {
		console.log(`Received message: ${payload}`);

		eventBus.destory();

		process.exit();
	}).then(() => {
		console.log('Listening to msg event');

		setTimeout(() => {
			eventBus.emit('msg', 'Hello');
		}, 5000);
	})
})

//Somewhere else in your code get reference to the event bus
const eventBus = EventBus.getByName('myEventBus');
eventBus.emit('msg', 'Hello?');
```

## Docs
```typescript
//Register listener for specific event. To avoid sideeffects, you have to wait for the promise to resolve
on<T>(event: string, callback: (payload: T) => void): Promise<void>;

//Emit event on the event bus with passed payload
emit<T>(event: string, payload: T): void;

//Sends ping to all listeners and waits maximum <timeout> milliseconds
//Returns true if at least <minResponseCount> clients responded, false otherwise
ping(timeout?: number, minResponseCount?: number): Promise<boolean>;

//Destroy this event bus instance and disconnect from redis
//Watch out: If there are other clients connected, these instances will not be destroyed!
destory(): void;

//Property which indicated wether the event bus is connected
connected: boolean;

//Creates a new event bus with a unique name and optional node-redis client options
static create(name: string, clientOpts?: Redis.ClientOpts): Promise<EventBus>;

//Access existing event bus instance by unique name
static getByName(name: string): EventBus;
```

## Typescript
This package automatically ships a `d.ts` definition file!
