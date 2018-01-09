import * as Redis from 'redis';

export class EventBus {
	//Static variables
	private static _eventBusInstances: Map<string, EventBus>;

	//Member variables
	private readonly _pub: Redis.RedisClient;
	private readonly _sub: Redis.RedisClient;
	private readonly _name: string;

	private constructor(name: string, clientOpts?: Redis.ClientOpts) {
		this._pub = Redis.createClient(clientOpts);
		this._sub = Redis.createClient(clientOpts);
	}

	//Register event listener
	public on<T>(event: string, callback: (payload: T) => void): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			//Listen for the subscribe event
			this._sub.on('subscribe', (channel: string, count: number) => {
				if (channel === event) {
					resolve();
				}
			});

			//Listen for the message event
			this._sub.on('message', (channel: string, message: any) => {
				if (event === channel) {
					callback(message as T);
				}
			});

			//Subscribe on the event bus
			this._sub.subscribe(event);
		});
	}

	//Emit a new event to the event bus
	public emit<T>(event: string, payload: T): void {
		this._pub.publish(event, typeof payload === 'string' ? payload : JSON.stringify(payload));
	}

	//Destroy event bus instance
	public destory(): void {
		this._sub.unsubscribe();

		this._sub.quit();
		this._pub.quit();

		if (EventBus._eventBusInstances.has(this._name)) {
			EventBus._eventBusInstances.delete(this._name);
		}
	}

	//Returns connection status of redis client
	public get connected(): boolean {
		if (this._pub && this._sub) {
			return this._pub.connected && this._sub.connected;
		} else {
			throw new Error('Event bus instance is undefined');
		}
	}

	//Factory method
	public static create(name: string, clientOpts?: Redis.ClientOpts): EventBus {
		//Lazy init event bus instances map
		if (EventBus._eventBusInstances === undefined || EventBus._eventBusInstances === null) {
			EventBus._eventBusInstances = new Map<string, EventBus>();
		}

		let instance = EventBus._eventBusInstances.get(name);

		//Add prefefis to client opts
		let _clientOpts: Redis.ClientOpts = {};

		if (clientOpts) {
			_clientOpts = { ...clientOpts };
		}

		_clientOpts = {
			..._clientOpts,
			//Preserve prefix if exists to avoid collisions
			prefix: `${_clientOpts.prefix !== undefined ? _clientOpts.prefix : ''}node-redis-eventbus:${name}`
		}

		if (instance !== undefined) {
			return instance;
		} else {
			//Create new instance
			instance = new EventBus(name, clientOpts);

			//Store to map
			EventBus._eventBusInstances.set(name, instance);

			return instance;
		}
	}

	public static getByName(name: string): EventBus {
		//Lazy init event bus instances map
		if (EventBus._eventBusInstances === undefined || EventBus._eventBusInstances === null) {
			EventBus._eventBusInstances = new Map<string, EventBus>();
		}

		//Return stored or new instance
		let instance = EventBus._eventBusInstances.get(name);

		if (instance !== undefined) {
			return instance;
		} else {
			throw new Error(`An event bus instance with the name ${name} cannot be found.`);
		}
	}
}