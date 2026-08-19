export function append<T>(arr: T[], value: T): boolean {
	if (!arr.includes(value)) {
		arr.push(value);
		return true;
	}
	return false;
}

export function remove<T>(arr: T[], value: T): boolean {
	const index = arr.indexOf(value);
	if (index !== -1) {
		arr.splice(index, 1);
		return true;
	}
	return false;
}

export function set<T>(arr: T[], source: T[]): void {
	arr.length = 0;
	for (const item of source) {
		arr.push(item);
	}
}

export function subtract<T>(a: T[], b: T[]): T[] {
	return a.filter((item) => !b.includes(item));
}

export const empty: never[] = [];

Array.empty = empty;
Array.subtract = subtract;

Object.defineProperty(Array.prototype, 'append', {
	enumerable: false,
	value: function <T>(this: T[], value: T): boolean {
		if (this.indexOf(value) === -1) {
			this.push(value);
			return true;
		}
		return false;
	}
});

Object.defineProperty(Array.prototype, 'remove', {
	enumerable: false,
	value: function <T>(this: T[], value: T): boolean {
		const index = this.indexOf(value);
		if (index !== -1) {
			this.splice(index, 1);
			return true;
		}
		return false;
	}
});

Object.defineProperty(Array.prototype, 'set', {
	enumerable: false,
	value: function <T>(this: T[], array: Array<T>): void {
		const length = Math.min(this.length, array.length);
		for (let i = 0; i < length; i++) {
			this[i] = array[i];
		}
	}
});
