export const EventBus = new (class EventBus {
	events: { [k: string]: Array<(...args: any[]) => any> } = {};
	constructor() {
		this.events = {};
	}

	on(eventName: any, callback: any) {
		if (!this.events[eventName]) {
			this.events[eventName] = [];
		}
		this.events[eventName].push(callback);

		return () => {
			this.off(eventName, callback);
		};
	}

	off(eventName: any, callback: any) {
		if (!this.events[eventName]) return;

		this.events[eventName] = this.events[eventName].filter((cb: any) => cb !== callback);

		if (this.events[eventName].length === 0) {
			delete this.events[eventName];
		}
	}

	emit(eventName: any, data?: any) {
		if (!this.events[eventName]) return;

		const callbacks = [...this.events[eventName]];

		callbacks.forEach((callback) => {
			try {
				callback(data);
			} catch (err) {
				console.error(`Error in event handler for ${eventName}:`, err);
			}
		});
	}

	once(eventName: any, callback: any) {
		const wrapper = (data: any) => {
			callback(data);
			this.off(eventName, wrapper);
		};

		this.on(eventName, wrapper);

		return () => {
			this.off(eventName, wrapper);
		};
	}

	clear() {
		this.events = {};
	}
})();
