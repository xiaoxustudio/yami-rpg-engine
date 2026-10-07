export interface WordListShape {
	count: number;
	push(string: string): this;
	join(joint?: string): string;
	readonly length: number;
	[Symbol.iterator](): IterableIterator<string>;
}

export class WordList {
	count: number = 0;
	#arr: string[] = [];

	constructor() {
		this.count = 0;
	}

	push(string: string): this {
		if (string) this.#arr[this.count++] = string;
		return this;
	}

	join(joint: string = '$_delimiter_$, $_/_$'): string {
		const length = this.count;
		if (length === 0) {
			return '';
		}
		this.count = 0;
		const arr = this.#arr;
		let string = arr[0];
		for (let i = 1; i < length; i++) {
			string += joint + arr[i];
		}
		return string;
	}

	get length(): number {
		return this.count;
	}
	*[Symbol.iterator](): IterableIterator<string> {
		const arr = this.#arr;
		for (let i = 0; i < this.count; i++) yield arr[i];
	}
}
