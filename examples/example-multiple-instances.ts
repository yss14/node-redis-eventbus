import { EventBus } from './../src/index';
import { setTimeout } from 'timers';

/*
Simply run two instances by

INSTANCE=1 ts-node examples/example-multiple-instances.ts
INSTANCE=2 ts-node examples/example-multiple-instances.ts

in two seperate terminal/bash windows
*/

(async () => {
	let eventBus: EventBus;

	if (parseInt(process.env.INSTANCE) === 1) {
		eventBus = await EventBus.create('myEventBus', { prefix: 'instance1' });
	} else {
		eventBus = await EventBus.create('myEventBus', { prefix: 'instance2' });
	}

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