export const EventBus = new (class EventBus {
	events: { [k: string]: Array<(data?: unknown) => void> } = {};
	constructor() {
		this.events = {};
	}

	on(eventName: string, callback: (data?: unknown) => void) {
		if (!this.events[eventName]) {
			this.events[eventName] = [];
		}
		this.events[eventName].push(callback);

		return () => {
			this.off(eventName, callback);
		};
	}

	off(eventName: string, callback: (data?: unknown) => void) {
		if (!this.events[eventName]) return;

		this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);

		if (this.events[eventName].length === 0) {
			delete this.events[eventName];
		}
	}

	emit(eventName: string, data?: unknown) {
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

	once(eventName: string, callback: (data?: unknown) => void) {
		const wrapper = (data?: unknown) => {
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
