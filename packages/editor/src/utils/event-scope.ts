interface EventScopeEntry {
	type: string;
	listener: EventListener;
	options?: boolean | AddEventListenerOptions;
}

export interface EventScope {
	on(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void;
	off(): void;
}

export function collect(target: EventTarget): EventScope {
	const entries: EventScopeEntry[] = [];
	return {
		on(type, listener, options) {
			target.addEventListener(type, listener, options);
			entries.push({ type, listener, options });
		},
		off() {
			for (const entry of entries) {
				target.removeEventListener(entry.type, entry.listener, entry.options);
			}
			entries.length = 0;
		}
	};
}
