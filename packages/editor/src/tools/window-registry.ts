const windows = new Map<string, unknown>();
const pending = new Map<string, Promise<unknown>>();

function ensure(name: string, loader: () => Promise<unknown>): Promise<unknown> {
	let promise = pending.get(name);
	if (!promise) {
		promise = loader().then((instance) => {
			windows.set(name, instance);
			return instance;
		});
		pending.set(name, promise);
	}
	return promise;
}

export function getLazyWindow<T extends object>(name: string, loader: () => Promise<T>): T {
	const proxy = new Proxy({} as object, {
		get(_target: object, prop: string | symbol) {
			if (prop === 'then') return undefined;
			const instance = windows.get(name);
			if (instance === undefined) {
				void ensure(name, loader as () => Promise<unknown>);
				return undefined;
			}
			return (instance as Record<string, unknown>)[prop as string];
		},
		set(_target: object, prop: string | symbol, value: unknown) {
			const instance = windows.get(name);
			if (instance !== undefined) {
				(instance as Record<string, unknown>)[prop as string] = value;
				return true;
			}
			void ensure(name, loader as () => Promise<unknown>).then((inst) => {
				(inst as Record<string, unknown>)[prop as string] = value;
			});
			return true;
		},
		has() {
			return true;
		},
		ownKeys() {
			return [];
		},
		getOwnPropertyDescriptor() {
			return { configurable: true, enumerable: true };
		}
	}) as T;
	return proxy;
}

export function loadWindow<T>(name: string, loader: () => Promise<T>): Promise<T> {
	return ensure(name, loader as () => Promise<unknown>) as Promise<T>;
}

export function primeWindows(instances: Record<string, unknown>): void {
	for (const [key, value] of Object.entries(instances)) {
		if (value !== undefined) {
			const name = key.toLowerCase();
			windows.set(name, value);
			pending.set(name, Promise.resolve(value));
		}
	}
}
