import { $, getElementReader } from '@/util/dom.ts';
import { getFocus, on, write } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';
function getWindow() {
	return (window as any).Window;
}

export const TriggerGetter = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

TriggerGetter.initialize = function () {
	if (!$('#triggerGetter-type')) return;
	$('#triggerGetter-type').loadItems([
		{ name: 'Event Trigger', value: 'trigger' },
		{ name: 'Latest Trigger', value: 'latest' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#triggerGetter-type')
		.enableHiddenMode()
		.relate([{ case: 'variable', targets: [$('#triggerGetter-variable')] }]);

	on($('#triggerGetter-confirm'), 'click', this.confirm);
};

TriggerGetter.open = function (target) {
	this.target = target;
	getWindow().open('triggerGetter');

	let variable = { type: 'local', key: '' };
	const trigger = target.dataValue;
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

TriggerGetter.confirm = function (event) {
	const read = getElementReader('triggerGetter');
	const type = read('type');
	let getter;
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
	this.target.input(getter);
	getWindow().close('triggerGetter');
}.bind(TriggerGetter);
