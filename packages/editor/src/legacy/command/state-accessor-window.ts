import { $, getElementReader } from '@/util/dom.ts';
import { getFocus, on, write } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';
function getWindow() {
	return (window as any).Window;
}

export const StateGetter = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

StateGetter.initialize = function () {
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

StateGetter.open = function (target) {
	this.target = target;
	getWindow().open('stateGetter');

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

StateGetter.checkDataForPlugin = function (data) {
	if (data instanceof Object) {
		return data.getter === 'state';
	}
	return false;
};

StateGetter.createDefaultForPlugin = function () {
	return { getter: 'state', type: 'trigger' };
};

StateGetter.confirm = function (event) {
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
	this.target.input(getter);
	getWindow().close('stateGetter');
}.bind(StateGetter);
