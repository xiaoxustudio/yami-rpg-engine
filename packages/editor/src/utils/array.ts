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

export const empty: any[] = [];
