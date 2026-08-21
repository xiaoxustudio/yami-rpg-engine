import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { useTriggerGetterWindow } from '@app/composables/useTriggerGetterWindow';
import { AccessorBaseShape } from '@app/types/legacy-shapes.ts';

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
	useTriggerGetterWindow().open(target);
};

TriggerGetter.confirm = function (this: typeof TriggerGetter, event: Event) {
	useTriggerGetterWindow().confirm();
};
