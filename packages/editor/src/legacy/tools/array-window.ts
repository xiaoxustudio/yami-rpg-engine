import { useArrayWindow } from '@app/composables/useArrayWindow';
import { $ } from '@app/utils/dom';
import { on, read } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { h, render } from 'vue';

interface ArrayListTarget {
	previousSibling: Node;
	filter: string;
	input?: (value: unknown) => void;
	[k: string]: unknown;
}

interface ArrayListInterface {
	parsers: Record<string, (value: unknown) => string>;
	defaults: Record<string, number | string>;
	windows: Record<string, string>;
	inputs: Record<string, HTMLElement>;
	initialize(list: HTMLElement): void;
	parse(value: unknown, data: unknown, index: number): HTMLElement[];
	open(value: unknown): void;
	save(): unknown;
}

export const ArrayList: {
	list: HTMLElement;
	target: ArrayListTarget | null;
	changed: boolean;
	interface: ArrayListInterface;
	initialize: ((this: typeof ArrayList, list: HTMLElement) => void) | null;
	open: ((this: typeof ArrayList, target: ArrayListTarget) => void) | null;
	windowClose: ((this: typeof ArrayList, event: Event) => void) | null;
	windowClosed: ((this: typeof ArrayList, event: Event) => void) | null;
	listChange: ((this: typeof ArrayList, event: Event) => void) | null;
	confirm: ((this: typeof ArrayList, event: Event) => void) | null;
} = {
	get list() {
		return $('#arrayList-list');
	},
	target: null as unknown as ArrayListTarget | null,
	get changed() {
		return useArrayWindow().changed;
	},
	interface: null as unknown as ArrayListInterface,
	initialize: null as unknown as (this: typeof ArrayList, list: HTMLElement) => void,
	open: null as unknown as ((this: typeof ArrayList, target: ArrayListTarget) => void) | null,
	windowClose: null as unknown as (this: typeof ArrayList, event: Event) => void,
	windowClosed: null as unknown as (this: typeof ArrayList, event: Event) => void,
	listChange: null as unknown as (this: typeof ArrayList, event: Event) => void,
	confirm: null as unknown as (this: typeof ArrayList, event: Event) => void
};

ArrayList.initialize = function (this: typeof ArrayList) {
	if (!this.list) return;
	this.list.bind(this.interface);

	$('#arrayList').addEventListener('close', this.windowClose!);
	$('#arrayList').addEventListener('closed', this.windowClosed!);
	on($('#arrayList-confirm'), 'click', this.confirm!);
};

ArrayList.open = function (this: typeof ArrayList, target: ArrayListTarget) {
	this.target = target;
	const label = target.previousSibling;
	const alias = label.textContent;
	$('#arrayList').setTitle(alias);
	useArrayWindow().open(read(target).slice(), (value) => {
		this.target?.input?.(value);
	});
};

ArrayList.windowClose = function (this: typeof ArrayList, event: Event) {
	useArrayWindow().onWindowClose(event);
};

ArrayList.windowClosed = function (this: typeof ArrayList, event: Event) {
	ArrayList.target = null;
	ArrayList.list.clear();
	useArrayWindow().onWindowClosed();
};

ArrayList.listChange = function (this: typeof ArrayList, event: Event) {
	useArrayWindow().markChanged();
};

ArrayList.confirm = function (this: typeof ArrayList, event: Event) {
	useArrayWindow().confirm();
};

ArrayList.interface = {
	parsers: {
		number: (number: unknown) => (number as number | string).toString(),
		string: (string: unknown) => Command.parseMultiLineString!(string as string)
	},
	defaults: {
		number: 0,
		string: ''
	},
	windows: {
		number: 'arrayList-number',
		string: 'arrayList-string'
	},
	inputs: {
		get number() {
			return $('#arrayList-number-value');
		},
		get string() {
			return $('#arrayList-string-value');
		}
	},
	initialize: function (this: typeof ArrayList, list: HTMLElement) {
		on($('#arrayList-number-confirm'), 'click', () => list.save());
		on($('#arrayList-string-confirm'), 'click', () => list.save());
	},
	parse: function (this: typeof ArrayList, value: unknown, data: unknown, index: number) {
		const { filter } = ArrayList.target!;
		const indexText = document.createElement('div');
		render(
			h(
				'div',
				{ class: 'array-index text' },
				Number.padZero(index, (data as ArrayLike<unknown>).length, ' ') + ':'
			),
			indexText
		);
		const valueText = document.createElement('div');
		render(
			h('div', { class: 'array-value text' }, ArrayList.interface.parsers[filter](value)),
			valueText
		);
		return [
			indexText.firstElementChild as HTMLElement,
			valueText.firstElementChild as HTMLElement
		];
	},
	open: function (this: typeof ArrayList, value: unknown) {
		const { filter } = ArrayList.target!;
		const int = ArrayList.interface;
		value = value ?? int.defaults[filter];
		const window = useArrayWindow();
		if (filter === 'number') {
			window.openNumber(value as number);
		} else {
			window.openString(value as string);
		}
	},
	save: function () {
		const { filter } = ArrayList.target!;
		const window = useArrayWindow();
		if (filter === 'number') {
			return window.confirmNumber();
		}
		return window.confirmString();
	}
};
