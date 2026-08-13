import { $, getElementReader } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, on, write } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { AccessorBaseShape } from '@/types/legacy-shapes.ts';

interface TriggerTarget {
	dataValue: {
		type: string;
		variable: { type: string; key: string };
	};
	read?: () => { type: string; variable: { type: string; key: string } };
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

export const TriggerGetter: AccessorBaseShape = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

TriggerGetter.initialize = function (this: typeof TriggerGetter) {
	if (!$('#triggerGetter-type')) return;
	$('#triggerGetter-type').loadItems([
		{ name: 'Event Trigger', value: 'trigger' },
		{ name: 'Latest Trigger', value: 'latest' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#triggerGetter-type')
		.enableHiddenMode()
		.relate([{ case: 'variable', targets: [$('#triggerGetter-variable')] }]);

	on($('#triggerGetter-confirm'), 'click', this.confirm!);
};

TriggerGetter.open = function (this: typeof TriggerGetter, target: TriggerTarget) {
	this.target = target;
	Window.open!('triggerGetter');

	let variable = { type: 'local', key: '' };
	const trigger = target.read?.()!;
	switch (trigger.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'variable':
			variable = trigger.variable;
			break;
	}
	write($('#triggerGetter-type'), trigger.type);
	write($('#triggerGetter-variable'), variable);
	getFocus($('#triggerGetter-type'));
};

TriggerGetter.confirm = function (this: typeof TriggerGetter, event: Event) {
	const read = getElementReader('triggerGetter');
	const type = read('type');
	let getter: Record<string, unknown> | undefined;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return getFocus($('#triggerGetter-variable'));
			}
			getter = { type, variable };
			break;
		}
	}
	this.target?.input?.(getter!);
	Window.close!('triggerGetter');
}.bind(TriggerGetter);
