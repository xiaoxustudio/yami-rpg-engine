export class UIInstanceList extends Array {
	set(key: string, value: any): void {
		this.setProperty(key, value);
	}

	setProperty(key: string, value: any): void {
		const keys = key.split('-');
		const last = keys.length - 1;
		const property = keys[last];
		for (const element of this) {
			let node = element;
			for (let i = 0; i < last; i++) {
				node = node[keys[i]];
			}
			node[property] = value;
		}
	}

	resize(): void {
		for (const element of this) {
			element.resize();
		}
	}
}
