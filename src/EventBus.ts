import * as Redis from 'redis';
import { resolve } from 'path';
import { clearTimeout } from 'timers';

export class EventBus {
	//Static variables
	private static _eventBusInstances: Map<string, EventBus>;

	//Member variables
	private readonly _pub: Redis.RedisClient;
	private readonly _sub: Redis.RedisClient;
	private readonly _name: string;
	private readonly _prefix: string;

	private constructor(name: string, clientOpts?: Redis.ClientOpts) {
		this._pub = Redis.createClient(clientOpts);
		this._sub = Redis.createClient(clientOpts);

		//Save prefix for filtering subscriptions on prefix later on
		if (clientOpts && clientOpts.prefix) {
			this._prefix = clientOpts.prefix;
		} else {
			this._prefix = '';
		}
	}

	private async init(): Promise<void> {
		//Listen for ping event
		await this._on<void>('ping', () => {
			//Emit pong event
			this._emit('pong', '', true);
		}, true);
	}

	//Register event listener
	public on<T>(event: string, callback: (payload: T) => void): Promise<void> {
		return this._on<T>(event, callback, false);
	}

	private _on<T>(event: string, callback: (payload: T) => void, internalCall: boolean = true): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			//Check if event is reserved event name
			if (!internalCall && this.isReservedEventName(event)) {
				reject(new Error(`Reserved event name ${event} cannot be registered`));
			}

			//Listen for the subscribe event
			this._sub.on('subscribe', (channel: string, count: number) => {
				let _channel = this.removePrefixFromChannelName(channel);

				if (_channel === event) {
					resolve();
				}
			});

			//Listen for the message event
			this._sub.on('message', (channel: string, message: any) => {
				let _channel = this.removePrefixFromChannelName(channel);

				if (event === _channel) {
					callback(message as T);
				}
			});

			//Subscribe on the event bus
			this._sub.subscribe(this.getPrefixedChannelName(event));
		});
	}

	//Emit a new event to the event bus
	public emit<T>(event: string, payload: T): void {
		return this._emit(event, payload, false);
	}

	private _emit<T>(event: string, payload: T, internalCall: boolean = true): void {
		//Check if event is reserved event name
		if (!internalCall && this.isReservedEventName(event)) {
			throw new Error(`Reserved event name ${event} cannot be registered`);
		}

		this._pub.publish(this.getPrefixedChannelName(event), typeof payload === 'string' ? payload : JSON.stringify(payload));
	}

	/*
		Send out a ping to all connected instances
		Waits for <timeout> seconds and returnes true, if at least <minResponseCount> clients responded
	*/
	public ping(timeout: number = 3000, minResponseCount: number = 1): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			let responseCount = 0;

			const timeoutRef = setTimeout(() => {
				//+1 because our instance itself will respond
				resolve(responseCount >= minResponseCount + 1);
			}, timeout);

			this._on<void>('pong', () => {
				responseCount++;

				//+1 because our instance itself will respond
				if (responseCount >= minResponseCount + 1) {
					//Cleat timeout
					clearTimeout(timeoutRef);

					resolve(true);
				}
			}, true);

			this._emit('ping', '', true);
		});
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

	//Private util methods
	private removePrefixFromChannelName(channel: string): string {
		if (this._prefix.length > 0) {
			return channel.substr(this._prefix.length + 1, channel.length - this._prefix.length);
		} else {
			return channel;
		}
	}

	private getPrefixedChannelName(channel: string): string {
		return `${this._prefix.length > 0 ? `${this._prefix}:` : ''}${channel}`;
	}

	private isReservedEventName(event: string): boolean {
		return event === 'ping' || event === 'pong';
	}

	//Factory method
	public static async create(name: string, clientOpts?: Redis.ClientOpts): Promise<EventBus> {
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

			//Init instance
			await instance.init();

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