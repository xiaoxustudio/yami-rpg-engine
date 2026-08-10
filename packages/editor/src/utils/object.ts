export function clone<T>(obj: T): T {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}
	if (obj instanceof Array) {
		return (obj as unknown as Array<unknown>).map((item: unknown) => clone(item)) as T;
	}
	if (obj instanceof Object) {
		const copy: Record<string, any> = {};
		for (const key in obj) {
			copy[key] = clone((obj as Record<string, unknown>)[key]);
		}
		return copy as T;
	}
	return obj;
}

export const empty: Record<string, never> = {};
