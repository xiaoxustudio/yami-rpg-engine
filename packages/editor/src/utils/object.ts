export function clone<T>(obj: T): T {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	if (obj instanceof Array) {
		return (obj as unknown as Array<unknown>).map((item: unknown) => clone(item)) as T;
	}
	if (obj instanceof Object) {
		const copy: Record<string, unknown> = {};
		for (const key in obj) {
			copy[key] = clone((obj as Record<string, unknown>)[key]);
		}
		return copy as T;
	}
	return obj;
}

export const empty: Record<string, never> = {};

Object.empty = empty;
Object.clone = (function IIFE() {
	const { isArray } = Array;
	const isPlainObject = (value: unknown): boolean => {
		if (value === null || typeof value !== 'object') return false;
		const proto = Object.getPrototypeOf(value);
		return proto === Object.prototype || proto === null;
	};
	const clone = <T>(object: T, seen: WeakMap<object, unknown>): T => {
		if (object === null || typeof object !== 'object') return object;
		if (seen.has(object as object)) {
			return seen.get(object as object) as T;
		}
		let copy: unknown[] | Record<PropertyKey, unknown>;
		if (isArray(object)) {
			const arr = object as unknown[];
			copy = new Array(arr.length);
			seen.set(object as object, copy);
			for (let i = 0; i < arr.length; i++) {
				const value = arr[i];
				(copy as unknown[])[i] = value instanceof Object ? clone(value, seen) : value;
			}
		} else if (isPlainObject(object)) {
			copy = {} as Record<PropertyKey, unknown>;
			seen.set(object as object, copy);
			for (const key in object as Record<string, unknown>) {
				const value = (object as Record<string, unknown>)[key];
				(copy as Record<string, unknown>)[key] =
					value instanceof Object ? clone(value, seen) : value;
			}
		} else {
			return object;
		}
		return copy as T;
	};
	return function <T>(object: T): T {
		return clone(object, new WeakMap());
	};
})();
