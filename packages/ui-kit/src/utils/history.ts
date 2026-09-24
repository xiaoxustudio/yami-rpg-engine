import { macRedoKey } from './dom';
import { Timer } from './timer';
import { dispatchChangeEvent } from './dom';

export type HistoryOperation = 'undo' | 'redo';

export interface IEditableHistory {
	stack: unknown[];
	index: number;
	reset(): void;
	save(data?: unknown): void;
	restore(operation: HistoryOperation): void;
	canUndo(): boolean;
	canRedo(): boolean;
}

export interface ICapacityHistory extends IEditableHistory {
	capacity: number;
}

export const HistoryTimer = new Timer({
	duration: 2000,
	callback: (timer: Timer) => {
		(timer as Timer & { complete: boolean }).complete = true;
	}
}) as Timer & {
	complete: boolean;
	type: string;
	start: (type: string) => void;
};

HistoryTimer.complete = true;

HistoryTimer.start = function (type: string): void {
	if (this.complete) {
		this.complete = false;
		this.add();
	}
	this.type = type;
	this.elapsed = 0;
};

HistoryTimer.finish = function (): void {
	if (!this.complete) {
		this.complete = true;
		this.remove();
	}
};

export class NumberHistory implements IEditableHistory {
	static restoring: boolean;
	input: HTMLInputElement;
	stack: { value: string }[];
	index: number;
	lastValue: string;
	history!: NumberHistory;
	value!: string;

	constructor(input: HTMLInputElement) {
		this.input = input;
		this.stack = [];
		this.index = -1;
		this.lastValue = '';

		// oxlint-disable-next-line unbound-method
		input.addEventListener('keydown', this.inputKeydown);
		// oxlint-disable-next-line unbound-method
		input.addEventListener('input', this.inputInput as EventListener);
		// oxlint-disable-next-line unbound-method
		input.addEventListener('blur', this.inputBlur);
	}

	reset() {
		if (this.stack.length !== 0) {
			this.stack = [];
			this.index = -1;
		}
		this.lastValue = this.input.value;
	}

	save() {
		const data = {
			value: this.lastValue
		};

		const stack = this.stack;
		const length = this.index + 1;
		if (length < stack.length) {
			stack.length = length;
		}

		if (stack.length < 20) {
			this.index++;
			stack.push(data);
		} else {
			stack.shift();
			stack.push(data);
		}
	}

	restore(operation: HistoryOperation) {
		let index = this.index;
		if (operation === 'redo') {
			index++;
		}
		if (index >= 0 && index < this.stack.length) {
			const input = this.input;
			const data = this.stack[index];
			const { value } = data;
			data.value = this.lastValue;
			NumberHistory.restoring = true;
			input.select();
			document.execCommand('insertText', false, value);
			if (operation === 'undo') input.select();
			NumberHistory.restoring = false;
			HistoryTimer.finish();

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

	canUndo() {
		return this.index >= 0;
	}

	canRedo() {
		return this.index + 1 < this.stack.length;
	}

	inputKeydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.code) {
				case 'KeyZ':
					if (!macRedoKey(event)) {
						if (this.history.canUndo()) this.history.restore('undo');
						break;
					}
				case 'KeyY':
					if (this.history.canRedo()) this.history.restore('redo');
					break;
			}
		}
	}

	inputInput(event: InputEvent) {
		if (!NumberHistory.restoring) {
			switch (event.inputType) {
				case 'insertCompositionText':
					break;
				case 'insertText':
				case 'deleteContentForward':
				case 'deleteContentBackward':
					if (HistoryTimer.complete || HistoryTimer.type !== event.inputType) {
						this.history.save();
					}
					HistoryTimer.start(event.inputType);
					break;
				case undefined:
					if (HistoryTimer.complete || HistoryTimer.type !== 'quickInput') {
						this.history.save();
					}
					HistoryTimer.start('quickInput');
					break;
				default:
					this.history.save();
					HistoryTimer.finish();
					break;
			}
		}
		switch (event.inputType) {
			case 'insertCompositionText':
				break;
			default:
				this.history.lastValue = this.value;
				break;
		}
	}

	inputBlur(_event: FocusEvent) {
		HistoryTimer.finish();
	}
}

NumberHistory.restoring = false;

export class TextHistory implements IEditableHistory {
	input: (HTMLInputElement | HTMLTextAreaElement) & {
		replace?: (value: string | number) => void;
	};
	stack: {
		deleted: string;
		inserted: string;
		lastStart: number;
		lastEnd: number;
		editingStart: number;
	}[];
	index: number;
	inputType: string;
	deleted: string;
	inserted: string;
	lastInsert: string | null;
	lastStart: number;
	lastEnd: number;
	editingStart: number;
	selectionStart: number;
	selectionEnd: number;
	history!: TextHistory;

	static restoring: boolean;
	static eventStruct: { inputType: string; data: string | null };
	static inputReplace: (value: string | number) => void;

	constructor(
		input: (HTMLInputElement | HTMLTextAreaElement) & {
			replace?: (value: string | number) => void;
		}
	) {
		this.input = input;
		this.stack = [];
		this.index = -1;
		this.inputType = '';
		this.deleted = '';
		this.inserted = '';
		this.lastInsert = '';
		this.lastStart = 0;
		this.lastEnd = 0;
		this.editingStart = 0;
		this.selectionStart = 0;
		this.selectionEnd = 0;

		input.replace = TextHistory.inputReplace;

		// oxlint-disable-next-line unbound-method
		input.addEventListener('keydown', this.inputKeydown as EventListener);
		// oxlint-disable-next-line unbound-method
		input.addEventListener('beforeinput', this.inputBeforeinput as EventListener);
		// oxlint-disable-next-line unbound-method
		input.addEventListener('input', this.inputInput as EventListener);
		// oxlint-disable-next-line unbound-method
		input.addEventListener('blur', this.inputBlur as EventListener);
		// oxlint-disable-next-line unbound-method
		input.addEventListener('compositionstart', this.inputCompositionstart as EventListener);
		// oxlint-disable-next-line unbound-method
		input.addEventListener('compositionend', this.inputCompositionEnd as EventListener);
	}

	reset() {
		if (this.stack.length !== 0) {
			this.stack = [];
			this.index = -1;
		}
		this.inputType = '';
		this.lastInsert = '';
	}

	save() {
		if (this.inputType) {
			this.inputType = '';
		} else {
			return;
		}
		if (!this.deleted && !this.inserted) {
			return;
		}

		const data = {
			deleted: this.deleted,
			inserted: this.inserted,
			lastStart: this.lastStart,
			lastEnd: this.lastEnd,
			editingStart: this.editingStart
		};

		const stack = this.stack;
		const length = this.index + 1;
		if (length < stack.length) {
			stack.length = length;
		}

		if (stack.length < 20) {
			this.index++;
			stack.push(data);
		} else {
			stack.shift();
			stack.push(data);
		}
	}

	restore(operation: HistoryOperation) {
		if (operation === 'undo') {
			this.save();
		}
		let index = this.index;
		if (operation === 'redo') {
			index++;
		}
		if (index >= 0 && index < this.stack.length) {
			const input = this.input;
			const data = this.stack[index];
			const { deleted, inserted, lastStart, lastEnd, editingStart } = data;

			let inputType;
			TextHistory.restoring = true;
			switch (operation) {
				case 'undo':
					inputType = 'historyUndo';
					if (inserted.length > 0) {
						input.selectionStart = editingStart;
						input.selectionEnd = editingStart + inserted.length;
						document.execCommand('delete');
					}
					if (deleted.length > 0) {
						input.selectionStart = editingStart;
						input.selectionEnd = editingStart;
						document.execCommand('insertText', false, deleted);
						input.selectionStart = lastStart;
						input.selectionEnd = lastEnd;
					}
					this.index--;
					break;
				case 'redo':
					inputType = 'historyRedo';
					if (deleted.length > 0) {
						input.selectionStart = editingStart;
						input.selectionEnd = editingStart + deleted.length;
						document.execCommand('delete');
					}
					if (inserted.length > 0) {
						input.selectionStart = editingStart;
						input.selectionEnd = editingStart;
						document.execCommand('insertText', false, inserted);
					}
					this.index++;
					break;
			}
			TextHistory.restoring = false;
			HistoryTimer.finish();
			input.dispatchEvent(
				new InputEvent('input', {
					inputType: inputType,
					bubbles: true
				})
			);
		}
	}

	canUndo() {
		return this.index >= 0 || !!this.inputType;
	}

	canRedo() {
		return this.index + 1 < this.stack.length;
	}

	updateStates(event: InputEvent | { inputType: string; data: string | null }) {
		const { input } = this;
		const inputType = event.inputType;
		if (this.inputType !== inputType) {
			this.inputType = inputType ?? 'unknown';
			this.inserted = '';
			this.deleted = '';
			this.lastStart = input.selectionStart!;
			this.lastEnd = input.selectionEnd!;
			this.editingStart = input.selectionStart!;
			if (input.selectionStart !== input.selectionEnd) {
				this.deleted = input.value.slice(input.selectionStart!, input.selectionEnd!);
			}
		}
		switch (inputType) {
			case 'insertLineBreak':
				this.inserted += '\n';
				break;
			case 'insertText':
				if (event.data) {
					this.inserted += event.data;
				}
				break;
			case 'deleteContentForward':
				if (
					input.selectionStart! < input.value.length &&
					input.selectionStart === input.selectionEnd
				) {
					const char = input.value[input.selectionStart!];
					this.deleted = this.deleted + char;
				}
				break;
			case 'deleteContentBackward':
				if (input.selectionStart! > 0 && input.selectionStart === input.selectionEnd) {
					const char = input.value[input.selectionStart! - 1];
					this.deleted = char + this.deleted;
					this.editingStart--;
				}
				break;
			case 'replaceText':
				this.inserted = event.data!;
				break;
			default:
				if (event.data) {
					this.inserted =
						event.data.indexOf('\r') !== -1
							? event.data.replace(/\r/g, '')
							: event.data;
				}
				break;
		}
	}

	updateSelection(event: { data: string | null }) {
		const { input } = this;
		this.lastInsert = event.data;
		this.selectionStart = input.selectionStart!;
		this.selectionEnd = input.selectionEnd!;
	}

	inputKeydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.code) {
				case 'KeyZ':
					if (!macRedoKey(event)) {
						if (this.history.canUndo()) this.history.restore('undo');
						break;
					}
				case 'KeyY':
					if (this.history.canRedo()) this.history.restore('redo');
					break;
			}
		}
	}

	inputBeforeinput(event: InputEvent | { inputType: string; data: string | null }) {
		const { history } = this;
		switch (event.inputType) {
			case 'insertCompositionText':
				return;
			case 'insertLineBreak':
				if (this instanceof HTMLInputElement) {
					return;
				}
			case 'insertText':
				switch (event.data) {
					case ' ':
					case '<':
						if (history.lastInsert !== event.data) {
							HistoryTimer.finish();
						}
						break;
				}
			case 'deleteContentForward':
			case 'deleteContentBackward':
				if (
					history.inputType !== '' &&
					(HistoryTimer.complete ||
						HistoryTimer.type !== event.inputType ||
						history.selectionStart !== this.selectionStart ||
						history.selectionEnd !== this.selectionEnd)
				) {
					history.save();
				}
				HistoryTimer.start(event.inputType);
				switch (event.data) {
					case ':':
					case '>':
						if (history.lastInsert !== event.data) {
							HistoryTimer.finish();
						}
						break;
				}
				break;
			case 'replaceText':
				if (
					history.inputType !== null &&
					(HistoryTimer.complete || HistoryTimer.type !== event.inputType)
				) {
					history.save();
				}
				HistoryTimer.start(event.inputType);
				break;
			case 'inputCompositionText':
			default:
				history.save();
				HistoryTimer.finish();
				break;
		}
		history.updateStates(event);
	}

	inputInput(event: InputEvent) {
		switch (event.inputType) {
			case 'insertCompositionText':
				break;
			default:
				if (TextHistory.restoring) {
					event.stopImmediatePropagation();
				} else {
					this.history.updateSelection(event);
				}
				break;
		}
	}

	inputBlur(_event: FocusEvent) {
		HistoryTimer.finish();
	}

	inputCompositionstart(event: CompositionEvent) {
		const { history } = this;
		const struct = TextHistory.eventStruct;
		struct.data = null;
		history.save();
		history.inputBeforeinput.call(this, struct);
		history.updateSelection(event);
	}

	inputCompositionEnd(event: CompositionEvent) {
		const { history } = this;
		if (event.data || history.deleted) {
			const struct = TextHistory.eventStruct;
			struct.data = event.data;
			history.updateStates(struct);
			history.updateSelection(event);
		} else {
			history.inputType = '';
		}
	}
}

TextHistory.restoring = false;

TextHistory.eventStruct = {
	inputType: 'inputCompositionText',
	data: null
};

TextHistory.inputReplace = (function IIFE() {
	const eventStruct: { inputType: string; data: string | null } = {
		inputType: 'replaceText',
		data: null
	};
	return function (
		this: (HTMLInputElement | HTMLTextAreaElement) & { history: TextHistory },
		value: string | number
	) {
		if (typeof value === 'number') {
			value = value.toString();
		}
		eventStruct.data = value;
		this.select();
		this.history.inputBeforeinput.call(this, eventStruct);
		this.value = value;
	};
})();

interface CommandHistoryData {
	type: 'insert' | 'replace' | 'delete' | 'toggle';
	parent: unknown;
	array?: unknown[];
	index?: number;
	commands: unknown[];
	method?: string;
}

export class CommandHistory implements ICapacityHistory {
	list: HTMLElement & {
		unfoldCommand(parent: unknown): void;
		select(start: number, end?: number): void;
		scrollToSelection(mode?: string): void;
		// oxlint-disable-next-line no-explicit-any
		update(...args: any[]): void;
		dispatchChangeEvent(): void;
		getRangeByData(data: unknown): [number, number];
		enableItems(commands: unknown[]): void;
		disableItems(commands: unknown[]): void;
	};
	stack: CommandHistoryData[];
	index: number;
	capacity: number;
	versionId: number;
	lastState: number;

	constructor(list: CommandHistory['list']) {
		this.list = list;
		this.stack = [];
		this.index = -1;
		this.capacity = 100;
		this.versionId = 0;
		this.lastState = 0;
	}

	reset() {
		if (this.stack.length !== 0) {
			this.stack = [];
			this.index = -1;
		}
	}

	save(data: CommandHistoryData) {
		const stack = this.stack;
		const length = this.index + 1;
		if (length < stack.length) {
			stack.length = length;
		}

		if (stack.length < this.capacity) {
			this.index++;
			stack.push(data);
		} else {
			stack.shift();
			stack.push(data);
		}

		this.versionId++;
	}

	restore(operation: HistoryOperation) {
		const index =
			operation === 'undo' ? this.index : operation === 'redo' ? this.index + 1 : null;

		if (index !== null && index >= 0 && index < this.stack.length) {
			const list = this.list;
			const data = this.stack[index];
			switch (data.type) {
				case 'insert': {
					const { parent, array, index, commands } = data;
					const length = commands.length;
					const sCommand = commands[0];
					const eCommand = commands[length - 1];
					list.unfoldCommand(parent);
					if (operation === 'undo') {
						if (index! + length <= array!.length) {
							const start = list.getRangeByData(sCommand)[0];
							array!.splice(index!, length);
							list.update();
							list.select(start);
						}
					} else {
						if (index! <= array!.length) {
							array!.splice(index!, 0, ...commands);
							list.update();
							list.select(
								list.getRangeByData(sCommand)[0],
								list.getRangeByData(eCommand)[1]
							);
						}
					}
					break;
				}
				case 'replace': {
					const { parent, array, index, commands } = data;
					const [oldCommand, newCommand] = commands;
					list.unfoldCommand(parent);
					if (operation === 'undo') {
						if (index! < array!.length) {
							array![index!] = oldCommand;
							list.update();
							list.select(...list.getRangeByData(oldCommand));
						}
					} else {
						if (index! < array!.length) {
							array![index!] = newCommand;
							list.update();
							list.select(...list.getRangeByData(newCommand));
						}
					}
					break;
				}
				case 'delete': {
					const { parent, array, index, commands } = data;
					const length = commands.length;
					const sCommand = commands[0];
					const eCommand = commands[length - 1];
					list.unfoldCommand(parent);
					if (operation === 'undo') {
						if (index! <= array!.length) {
							array!.splice(index!, 0, ...commands);
							list.update();
							list.select(
								list.getRangeByData(sCommand)[0],
								list.getRangeByData(eCommand)[1]
							);
						}
					} else {
						if (index! + length <= array!.length) {
							const start = list.getRangeByData(sCommand)[0];
							array!.splice(index!, length);
							list.update();
							list.select(start);
						}
					}
					break;
				}
				case 'toggle': {
					const { parent, method, commands } = data;
					list.unfoldCommand(parent);
					if (
						(operation === 'undo' && method === 'disable') ||
						(operation === 'redo' && method === 'enable')
					) {
						list.enableItems(commands);
					} else {
						list.disableItems(commands);
					}
					const length = commands.length;
					const sCommand = commands[0];
					const eCommand = commands[length - 1];
					let [start, end] = list.getRangeByData(sCommand);
					if (length > 1) {
						end = list.getRangeByData(eCommand)[1];
					}
					list.update();
					list.select(start, end);
					break;
				}
			}
			list.scrollToSelection('restore');
			dispatchChangeEvent(list);

			switch (operation) {
				case 'undo':
					this.index--;
					this.versionId--;
					break;
				case 'redo':
					this.index++;
					this.versionId++;
					break;
			}
		}
	}

	saveState() {
		this.lastState = this.versionId;
	}

	restoreState() {
		let steps = this.lastState - this.versionId;
		if (Math.abs(steps) <= this.capacity) {
			const list = this.list;
			const empty = () => {};
			list.update = empty;
			list.select = empty;
			list.scrollToSelection = empty;
			while (steps < 0) {
				this.restore('undo');
				steps++;
			}
			while (steps > 0) {
				this.restore('redo');
				steps--;
			}
			// 第 146 轮：改用 `Reflect.deleteProperty`（手法库第 5 条：「索引签名写入 / 解锁只读」
			// 用 `Reflect.*`）—— 原先靠 `list as unknown as Record<string, unknown>` 把三个
			// **已声明为必需**的方法说成可删，只是为了骗过 `delete` 的可选性检查；
			// `Reflect.deleteProperty` 是内建签名（`(target: object, key: PropertyKey) => boolean`），
			// 行为与 `delete` 完全相同，而断言消失。
			Reflect.deleteProperty(list, 'update');
			Reflect.deleteProperty(list, 'select');
			Reflect.deleteProperty(list, 'scrollToSelection');
			return true;
		}
		return false;
	}

	canUndo() {
		return this.index >= 0;
	}

	canRedo() {
		return this.index + 1 < this.stack.length;
	}
}
