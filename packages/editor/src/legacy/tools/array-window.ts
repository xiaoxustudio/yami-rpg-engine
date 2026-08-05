import { $ } from '@/util/dom.ts';
import { addClass, getFocus, on, read, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Local } from './localization.ts';
import { Window } from './window-object.ts';

export const ArrayList = {
	get list() {
		return $('#arrayList-list');
	},
	target: null,
	changed: false,
	interface: null,
	initialize: null,
	open: null,
	windowClose: null,
	windowClosed: null,
	listChange: null,
	confirm: null
};

ArrayList.initialize = function () {
	if (!this.list) return;
	this.list.bind(this.interface);

	$('#arrayList').addEventListener('close', this.windowClose);
	$('#arrayList').addEventListener('closed', this.windowClosed);
	this.list.addEventListener('change', this.listChange);
	on($('#arrayList-confirm'), 'click', this.confirm);
};

ArrayList.open = function (target) {
	this.target = target;
	const label = target.previousSibling;
	const alias = label.textContent;
	$('#arrayList').setTitle(alias);
	Window.open('arrayList');

	this.list.write(read(target).slice());
	getFocus(this.list);
};

ArrayList.windowClose = function (event) {
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter('confirmation');
		Window.confirm(
			{
				message: get('closeUnsavedData')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close('arrayList');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(ArrayList);

ArrayList.windowClosed = function (event) {
	ArrayList.target = null;
	ArrayList.list.clear();
};

ArrayList.listChange = function (event) {
	ArrayList.changed = true;
};

ArrayList.confirm = function (event) {
	this.changed = false;
	this.target.input(this.list.read());
	Window.close('arrayList');
}.bind(ArrayList);

ArrayList.interface = {
	parsers: {
		number: (number) => number.toString(),
		string: (string) => Command.parseMultiLineString(string)
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
	initialize: function (list) {
		on($('#arrayList-number-confirm'), 'click', () => list.save());
		on($('#arrayList-string-confirm'), 'click', () => list.save());
	},
	parse: function (value, data, index) {
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
	open: function (value) {
		const { filter } = ArrayList.target;
		value = value ?? this.defaults[filter];
		Window.open(this.windows[filter]);
		const input = this.inputs[filter];
		write(input, value);
		getFocus(input, 'all');
	},
	save: function () {
		const { filter } = ArrayList.target;
		const value = read(this.inputs[filter]);
		Window.close(this.windows[filter]);
		return value;
	}
};
