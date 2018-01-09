import { EventBus } from './src/EventBus';
import { setTimeout } from 'timers';

const eventBus = EventBus.create('myEventBus');

(async () => {
	await eventBus.on<string>('msg', (payload) => console.log(`Received message: ${payload}`));

	setTimeout(() => {
		eventBus.emit<string>('msg', 'Hello');
	}, 5000);
})();