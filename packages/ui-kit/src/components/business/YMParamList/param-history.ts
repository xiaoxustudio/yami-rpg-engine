import { dispatchChangeEvent } from '../../../utils/dom';

export interface HistoryData {
	type: string;
	array: any[];
	index?: number;
	items?: any[];
	swap?: any;
	method?: string;
}

export class ParamListHistory {
	list: any;
	stack: HistoryData[];
	index: number;

	constructor(list: any) {
		this.list = list;
		this.stack = [];
		this.index = -1;
	}

	reset(): void {
		if (this.stack.length !== 0) {
			this.stack = [];
			this.index = -1;
		}
	}

	save(data: HistoryData): void {
		const stack = this.stack;
		const length = this.index + 1;
		if (length < stack.length) {
			stack.length = length;
		}

		if (stack.length < 100) {
			this.index++;
			stack.push(data);
		} else {
			stack.shift();
			stack.push(data);
		}
	}

	restore(operation: any): void {
		const index =
			operation === 'undo' ? this.index : operation === 'redo' ? this.index + 1 : null;

		if (index !== null && index >= 0 && index < this.stack.length) {
			const list = this.list;
			const data = this.stack[index];
			const type = data.type;
			ParamListHistory.restore(list, data, type, operation);

			switch (operation) {
				case 'undo':
					this.index--;
					break;
				case 'redo':
					this.index++;
					break;
			}
		}
	}

	canUndo(): boolean {
		return this.index >= 0;
	}

	canRedo(): boolean {
		return this.index + 1 < this.stack.length;
	}

	static restore(list: any, data: HistoryData, type: string, operation: any): void {
		const loaded = list.data === data.array;
		switch (type) {
			case 'insert': {
				const { array, index, items } = data;
				const length = items!.length;
				if (operation === 'undo') {
					if (index! + length <= array.length) {
						array.splice(index!, length);
						if (loaded) {
							list.update();
							list.select(index!);
						}
					}
				} else {
					if (index! <= array.length) {
						array.splice(index!, 0, ...items!);
						if (loaded) {
							list.update();
							list.select(index!, index! + length - 1);
						}
					}
				}
				break;
			}
			case 'replace': {
				const { array, index, swap } = data;
				if (index! < array.length) {
					data.swap = array[index!];
					array[index!] = swap;
					if (loaded) {
						list.update();
						list.select(index!);
					}
				}
				break;
			}
			case 'delete': {
				const { array, index, items } = data;
				const length = items!.length;
				if (operation === 'undo') {
					if (index! <= array.length) {
						array.splice(index!, 0, ...items!);
						if (loaded) {
							list.update();
							list.select(index!, index! + length - 1);
						}
					}
				} else {
					if (index! + length <= array.length) {
						array.splice(index!, length);
						if (loaded) {
							list.update();
							list.select(index!);
						}
					}
				}
				break;
			}
			case 'toggle': {
				const { array, method, items } = data;
				if (
					(operation === 'undo' && method === 'disable') ||
					(operation === 'redo' && method === 'enable')
				) {
					list.enableItems(items);
				} else {
					list.disableItems(items);
				}
				const length = items!.length;
				const sItem = items![0];
				const eItem = items![length - 1];
				list.update();
				list.select(array.indexOf(sItem), array.indexOf(eItem));
				break;
			}
		}
		if (loaded) {
			list.scrollToSelection();
			dispatchChangeEvent(list);
		}
	}
}
