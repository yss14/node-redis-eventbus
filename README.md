# node-redis-eventbus
A simple event bus powered by redis to communicate between multiple node instances.

## Install
```
npm install --save node-redis-eventbus

//or

yarn add node-redis-eventbus
```

## Usage
## Async/await pattern
```typescript
//Create new event bus instance with a unique identifier
const eventBus = EventBus.create('myEventBus');

//Wrap example by an async function
(async () => {
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
const eventBus = EventBus.create('myEventBus');

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

//Somewhere else in your code get reference to the event bus
const eventBus = EventBus.getByName('myEventBus');
eventBus.emit('msg', 'Hello?');
```

## Typescript
This package automatically ships a `d.ts` definition file!
