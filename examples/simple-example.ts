import { EventBus } from './../src/index';
import { setTimeout } from 'timers';

(async () => {
	const eventBus = await EventBus.create('myEventBus');

	await eventBus.on<string>('msg', (payload) => {
		console.log(`Received message: ${payload}`);

		eventBus.destory();

		process.exit();
	});

	console.log('Listening to msg event');

	setTimeout(() => {
		eventBus.emit<string>('msg', 'Hello');
	}, 5000);
})();