import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { useTriggerGetterWindow } from '@app/composables/useTriggerGetterWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const TriggerGetter = createAccessor({
	initialize() {
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
	},
	open(target: AccessorTarget) {
		useTriggerGetterWindow().open(target);
	},
	confirm() {
		useTriggerGetterWindow().confirm();
	}
});
