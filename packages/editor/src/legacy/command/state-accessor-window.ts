import { $, getElementReader } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, on, write } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { AccessorBaseShape, AccessorTarget } from '@/types/legacy-shapes.ts';

interface StateGetterShape extends AccessorBaseShape {
	checkDataForPlugin: ((data: unknown) => boolean) | null;
	createDefaultForPlugin: (() => { getter: string; type: string }) | null;
}

export const StateGetter: StateGetterShape = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

StateGetter.initialize = function (this: StateGetterShape) {
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

	on($('#stateGetter-confirm'), 'click', this.confirm!);
};

StateGetter.open = function (this: StateGetterShape, target: AccessorTarget) {
	this.target = target;
	Window.open!('stateGetter');

	let actor = { type: 'trigger' };
	let stateId = '';
	let variable = { type: 'local', key: '' };
	const state = target.read?.();
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

StateGetter.checkDataForPlugin = function (this: StateGetterShape, data: unknown) {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'state';
	}
	return false;
};

StateGetter.createDefaultForPlugin = function (this: StateGetterShape) {
	return { getter: 'state', type: 'trigger' };
};

StateGetter.confirm = function (this: StateGetterShape, event: Event) {
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
	if (this.target!.isPluginInput) {
		getter = { getter: 'state', ...getter };
	}
	this.target?.input?.(getter!);
	Window.close!('stateGetter');
}.bind(StateGetter);
