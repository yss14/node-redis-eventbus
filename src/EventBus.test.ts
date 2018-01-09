import { EventBus } from './EventBus';
import { setTimeout } from 'timers';

test('create new instance', async () => {
	const eventBusInstance = EventBus.create('myEventBus_test1');

	eventBusInstance.destory();
});

test('send single message with one event', async () => {
	const eventBusInstance = EventBus.create('myEventBus_test2');

	const MESSGAE_TO_SEND = 'Hello';
	const EVENT = 'msg';

	const result = await new Promise<string>(async (resolve, reject) => {
		await eventBusInstance.on<string>(EVENT, (payload) => {
			resolve(payload);
		});

		eventBusInstance.emit<string>(EVENT, MESSGAE_TO_SEND);
	});

	expect(result).toBe(MESSGAE_TO_SEND);

	eventBusInstance.destory();
});

test('send multiple messages with two event', async () => {
	const eventBusInstance = EventBus.create('myEventBus_test3');

	const MESSGAE_TO_SEND1 = 'Hello';
	const MESSGAE_TO_SEND2 = 'World';
	const MESSGAE_TO_SEND3 = 'How';
	const MESSGAE_TO_SEND4 = 'are';
	const MESSGAE_TO_SEND5 = 'you?';
	const EVENT1 = 'hello';
	const EVENT2 = 'ask';

	const result = await Promise.all([
		new Promise<string[]>(async (resolve, reject) => {
			let receivedMessages: string[] = [];

			await eventBusInstance.on<string>(EVENT1, (payload) => {
				receivedMessages.push(payload);

				if (receivedMessages.length === 2) {
					resolve(receivedMessages);
				}
			});

			eventBusInstance.emit<string>(EVENT1, MESSGAE_TO_SEND1);
			eventBusInstance.emit<string>(EVENT1, MESSGAE_TO_SEND2);
		}),
		new Promise<string[]>(async (resolve, reject) => {
			let receivedMessages: string[] = [];

			await eventBusInstance.on<string>(EVENT2, (payload) => {
				receivedMessages.push(payload);

				if (receivedMessages.length === 3) {
					resolve(receivedMessages);
				}
			});

			eventBusInstance.emit<string>(EVENT2, MESSGAE_TO_SEND3);
			eventBusInstance.emit<string>(EVENT2, MESSGAE_TO_SEND4);
			eventBusInstance.emit<string>(EVENT2, MESSGAE_TO_SEND5);
		})
	]);

	expect(result.length).toBe(2);
	expect(result[0].indexOf(MESSGAE_TO_SEND1) > -1).toBe(true);
	expect(result[0].indexOf(MESSGAE_TO_SEND2) > -1).toBe(true);
	expect(result[1].indexOf(MESSGAE_TO_SEND3) > -1).toBe(true);
	expect(result[1].indexOf(MESSGAE_TO_SEND4) > -1).toBe(true);
	expect(result[1].indexOf(MESSGAE_TO_SEND5) > -1).toBe(true);

	eventBusInstance.destory();
});

test('send multiple messages with two event on two buses', async () => {
	const eventBusInstanceA = EventBus.create('myEventBus1_test4');
	const eventBusInstanceB = EventBus.create('myEventBus2_test4');

	const MESSGAE_TO_SEND1 = 'Hello';
	const MESSGAE_TO_SEND2 = 'World';
	const MESSGAE_TO_SEND3 = 'How';
	const MESSGAE_TO_SEND4 = 'are';
	const MESSGAE_TO_SEND5 = 'you?';
	const EVENT1 = 'hello';
	const EVENT2 = 'ask';

	const result = await Promise.all([
		new Promise<string[][]>(async (resolve, reject) => {
			let receivedMessagesInstanceA: string[] = [];
			let receivedMessagesInstanceB: string[] = [];

			await eventBusInstanceA.on<string>(EVENT1, (payload) => {
				receivedMessagesInstanceA.push(payload);

				if (receivedMessagesInstanceA.length === 2 && receivedMessagesInstanceB.length === 2) {
					resolve([receivedMessagesInstanceA, receivedMessagesInstanceB]);
				}
			});

			await eventBusInstanceB.on<string>(EVENT1, (payload) => {
				receivedMessagesInstanceB.push(payload);

				if (receivedMessagesInstanceA.length === 2 && receivedMessagesInstanceB.length === 2) {
					resolve([receivedMessagesInstanceA, receivedMessagesInstanceB]);
				}
			});

			eventBusInstanceA.emit<string>(EVENT1, MESSGAE_TO_SEND1);
			eventBusInstanceB.emit<string>(EVENT1, MESSGAE_TO_SEND2);
		}),
		new Promise<string[][]>(async (resolve, reject) => {
			let receivedMessagesInstanceA: string[] = [];
			let receivedMessagesInstanceB: string[] = [];

			await eventBusInstanceA.on<string>(EVENT2, (payload) => {
				receivedMessagesInstanceA.push(payload);

				if (receivedMessagesInstanceA.length === 3 && receivedMessagesInstanceB.length === 3) {
					resolve([receivedMessagesInstanceA, receivedMessagesInstanceB]);
				}
			});

			await eventBusInstanceB.on<string>(EVENT2, (payload) => {
				receivedMessagesInstanceB.push(payload);

				if (receivedMessagesInstanceA.length === 3 && receivedMessagesInstanceB.length === 3) {
					resolve([receivedMessagesInstanceA, receivedMessagesInstanceB]);
				}
			});

			eventBusInstanceA.emit<string>(EVENT2, MESSGAE_TO_SEND3);
			eventBusInstanceB.emit<string>(EVENT2, MESSGAE_TO_SEND4);
			eventBusInstanceA.emit<string>(EVENT2, MESSGAE_TO_SEND5);
		})
	]);

	//array [<event>][<instance>][<messages>]
	expect(result.length).toBe(2);
	expect(result[0].length).toBe(2);
	expect(result[1].length).toBe(2);
	expect(result[0][0].length).toBe(2);
	expect(result[0][1].length).toBe(2);
	expect(result[1][0].length).toBe(3);
	expect(result[1][1].length).toBe(3);

	expect(result[0][0].indexOf(MESSGAE_TO_SEND1) > -1).toBe(true);
	expect(result[0][1].indexOf(MESSGAE_TO_SEND1) > -1).toBe(true);
	expect(result[0][0].indexOf(MESSGAE_TO_SEND2) > -1).toBe(true);
	expect(result[0][1].indexOf(MESSGAE_TO_SEND2) > -1).toBe(true);

	expect(result[1][0].indexOf(MESSGAE_TO_SEND3) > -1).toBe(true);
	expect(result[1][1].indexOf(MESSGAE_TO_SEND3) > -1).toBe(true);
	expect(result[1][0].indexOf(MESSGAE_TO_SEND4) > -1).toBe(true);
	expect(result[1][1].indexOf(MESSGAE_TO_SEND4) > -1).toBe(true);
	expect(result[1][0].indexOf(MESSGAE_TO_SEND5) > -1).toBe(true);
	expect(result[1][1].indexOf(MESSGAE_TO_SEND5) > -1).toBe(true);

	eventBusInstanceA.destory();
	eventBusInstanceB.destory();
});

test('send single message with one event prefixed', async () => {
	const eventBusInstance = EventBus.create('myEventBus_test5', { prefix: 'myprefix' });

	const MESSGAE_TO_SEND = 'Hello';
	const EVENT = 'msg';

	const result = await new Promise<string>(async (resolve, reject) => {
		await eventBusInstance.on<string>(EVENT, (payload) => {
			resolve(payload);
		});

		eventBusInstance.emit<string>(EVENT, MESSGAE_TO_SEND);
	});

	expect(result).toBe(MESSGAE_TO_SEND);

	eventBusInstance.destory();
});

test('two independent prefixed instances with same event key', async () => {
	const eventBusInstance1 = EventBus.create('myEventBus_test6_1', { prefix: 'instance1' });
	const eventBusInstance2 = EventBus.create('myEventBus_test6_2', { prefix: 'instance2' });

	const MESSGAE_TO_SEND1 = 'Hello';
	const MESSGAE_TO_SEND2 = 'World';
	const EVENT = 'msg';

	let messageReceived1: string[] = [];
	let messageReceived2: string[] = [];

	await eventBusInstance1.on<string>(EVENT, (payload) => {
		messageReceived1.push(payload);
	});

	await eventBusInstance2.on<string>(EVENT, (payload) => {
		messageReceived2.push(payload);
	});

	eventBusInstance1.emit(EVENT, MESSGAE_TO_SEND1);
	eventBusInstance2.emit(EVENT, MESSGAE_TO_SEND2);

	//Wait 3 seconds
	await new Promise((resolve) => setTimeout(resolve, 3000));

	expect(messageReceived1.indexOf(MESSGAE_TO_SEND1) > -1).toBe(true);
	expect(messageReceived1.indexOf(MESSGAE_TO_SEND2) > -1).toBe(false);

	expect(messageReceived2.indexOf(MESSGAE_TO_SEND1) > -1).toBe(false);
	expect(messageReceived2.indexOf(MESSGAE_TO_SEND2) > -1).toBe(true);

	eventBusInstance1.destory();
	eventBusInstance2.destory();
}, 10000);