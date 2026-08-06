import { $ } from '@/util/dom.ts';
import { addClass, getFocus, on, read, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Local } from './localization.ts';
import { Window } from './window-object.ts';

export const ArrayList = {
	get list() {
		return $('#arrayList-list');
	},
	target: null as any,
	changed: false,
	interface: null as any,
	initialize: null as any,
	open: null as any,
	windowClose: null as any,
	windowClosed: null as any,
	listChange: null as any,
	confirm: null as any
};

ArrayList.initialize = function (this: any) {
	if (!this.list) return;
	this.list.bind(this.interface);

	$('#arrayList').addEventListener('close', this.windowClose);
	$('#arrayList').addEventListener('closed', this.windowClosed);
	this.list.addEventListener('change', this.listChange);
	on($('#arrayList-confirm'), 'click', this.confirm);
};

ArrayList.open = function (this: any, target: any) {
	this.target = target;
	const label = target.previousSibling;
	const alias = label.textContent;
	$('#arrayList').setTitle(alias);
	Window.open!('arrayList');

	this.list.write(read(target).slice());
	getFocus(this.list);
};

ArrayList.windowClose = function (this: any, event: any) {
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter!('confirmation');
		Window.confirm!(
			{
				message: get('closeUnsavedData')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close!('arrayList');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(ArrayList);

ArrayList.windowClosed = function (this: any, event: any) {
	ArrayList.target = null;
	ArrayList.list.clear();
};

ArrayList.listChange = function (this: any, event: any) {
	ArrayList.changed = true;
};

ArrayList.confirm = function (this: any, event: any) {
	this.changed = false;
	this.target.input(this.list.read());
	Window.close!('arrayList');
}.bind(ArrayList);

ArrayList.interface = {
	parsers: {
		number: (number: any) => number.toString(),
		string: (string: any) => Command.parseMultiLineString!(string)
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
	initialize: function (this: any, list: any) {
		on($('#arrayList-number-confirm'), 'click', () => list.save());
		on($('#arrayList-string-confirm'), 'click', () => list.save());
	},
	parse: function (this: any, value: any, data: any, index: any) {
		const { filter } = ArrayList.target;
		const indexText = document.createElement('div');
		addClass(indexText, 'array-index');
		addClass(indexText, 'text');
		indexText.textContent = Number.padZero(index, data.length, ' ') + ':';

		const valueText = document.createElement('div');
		addClass(valueText, 'array-value');
		addClass(valueText, 'text');
		valueText.textContent = this.parsers[filter](value);

		return [indexText, valueText];
	},
	open: function (this: any, value: any) {
		const { filter } = ArrayList.target;
		value = value ?? this.defaults[filter];
		Window.open!(this.windows[filter]);
		const input = this.inputs[filter];
		write(input, value);
		getFocus(input, 'all');
	},
	save: function () {
		const { filter } = ArrayList.target;
		const value = read(this.inputs[filter]);
		Window.close!(this.windows[filter]);
		return value;
	}
};
