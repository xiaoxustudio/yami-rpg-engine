import { $, getElementReader } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, on, write } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';

export const StateGetter = {
	target: null as any,
	initialize: null as any,
	open: null as any,
	checkDataForPlugin: null as any,
	createDefaultForPlugin: null as any,
	confirm: null as any
};

StateGetter.initialize = function (this: any) {
	if (!$('#stateGetter-type')) return;
	$('#stateGetter-type').loadItems([
		{ name: 'Event Trigger State', value: 'trigger' },
		{ name: 'Latest State', value: 'latest' },
		{ name: 'By State ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#stateGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'by-id',
				targets: [$('#stateGetter-actor'), $('#stateGetter-stateId')]
			},
			{ case: 'variable', targets: [$('#stateGetter-variable')] }
		]);

	on($('#stateGetter-confirm'), 'click', this.confirm);
};

StateGetter.open = function (this: any, target: any) {
	this.target = target;
	Window.open!('stateGetter');

	let actor = { type: 'trigger' };
	let stateId = '';
	let variable = { type: 'local', key: '' };
	const state = target.dataValue;
	switch (state.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-id':
			actor = state.actor;
			stateId = state.stateId;
			break;
		case 'variable':
			variable = state.variable;
			break;
	}
	write($('#stateGetter-type'), state.type);
	write($('#stateGetter-actor'), actor);
	write($('#stateGetter-stateId'), stateId);
	write($('#stateGetter-variable'), variable);
	getFocus($('#stateGetter-type'));
};

StateGetter.checkDataForPlugin = function (this: any, data: any) {
	if (data instanceof Object) {
		return data.getter === 'state';
	}
	return false;
};

StateGetter.createDefaultForPlugin = function (this: any) {
	return { getter: 'state', type: 'trigger' };
};

StateGetter.confirm = function (this: any, event: any) {
	const read = getElementReader('stateGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-id': {
			const actor = read('actor');
			const stateId = read('stateId');
			if (stateId === '') {
				return getFocus($('#stateGetter-stateId'));
			}
			getter = { type, actor, stateId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return getFocus($('#stateGetter-variable'));
			}
			getter = { type, variable };
			break;
		}
	}
	if (this.target.isPluginInput) {
		getter = { getter: 'state', ...getter };
	}
	this.target?.input?.(getter);
	Window.close!('stateGetter');
}.bind(StateGetter);
