import type { YamiElement } from '@app/types/element-api';

export type ElementRegistry = Map<string, YamiElement | null>;

export const createElementRegistry = (mirror?: ElementRegistry): ElementRegistry => {
	const registry: ElementRegistry = new Map();
	if (!mirror) return registry;
	const set = registry.set.bind(registry);
	registry.set = (id: string, el: YamiElement | null): ElementRegistry => {
		mirror.set(id, el);
		return set(id, el);
	};
	return registry;
};

const registryRefCallbacks = new WeakMap<ElementRegistry, Map<string, (el: unknown) => void>>();

export const registryRef = (registry: ElementRegistry, id: string): ((el: unknown) => void) => {
	let callbacks = registryRefCallbacks.get(registry);
	if (!callbacks) {
		callbacks = new Map();
		registryRefCallbacks.set(registry, callbacks);
	}
	let callback = callbacks.get(id);
	if (!callback) {
		callback = (el: unknown): void => {
			if (el === null || el === undefined) {
				registry.set(id, null);
				return;
			}
			const element =
				el instanceof HTMLElement
					? (el as YamiElement)
					: ((el as { $el?: HTMLElement }).$el ?? null);
			registry.set(id, element as YamiElement | null);
		};
		callbacks.set(id, callback);
	}
	return callback;
};

export const registerElement = (registry: ElementRegistry, id: string, el: unknown): void => {
	registryRef(registry, id)(el);
};

export const registryElements = (registry: ElementRegistry, ids: string[]): YamiElement[] =>
	ids.map((id) => registry.get(id)).filter((el): el is YamiElement => el instanceof HTMLElement);

export const registryElement = <T extends object>(
	registry: ElementRegistry,
	id: string
): T | null => (registry.get(id) as T | null) ?? null;
