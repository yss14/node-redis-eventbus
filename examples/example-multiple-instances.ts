import { EventBus } from './../src/EventBus';
import { setTimeout } from 'timers';

/*
Simply run two instances by

INSTANCE=1 ts-node examples/example-multiple-instances.ts
INSTANCE=2 ts-node examples/example-multiple-instances.ts

in two seperate terminal/bash windows
*/

let eventBus: EventBus;

if (parseInt(process.env.INSTANCE) === 1) {
	eventBus = EventBus.create('myEventBus', { prefix: 'instance1' });
} else {
	eventBus = EventBus.create('myEventBus', { prefix: 'instance2' });
}

(async () => {
	const messageToSend = parseInt(process.env.INSTANCE) === 1 ? 'Instance1' : 'Instance2';

	await eventBus.on<string>('msg', (payload) => {
		console.log(`Received message: ${payload}`);

		setTimeout(() => {
			eventBus.emit<string>('msg', messageToSend);
		}, 2000);
	});

	console.log('Listening to msg event');

	setTimeout(() => {
		eventBus.emit<string>('msg', messageToSend);
	}, 5000);
})();