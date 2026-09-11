import { useTriggerGetterWindow } from '@app/composables/useTriggerGetterWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const TriggerGetter = createAccessor({
	initialize() {
		if (!this.fields?.get('triggerGetter-type')) return;
		this.fields?.get('triggerGetter-type')?.loadItems?.([
			{ name: 'Event Trigger', value: 'trigger' },
			{ name: 'Latest Trigger', value: 'latest' },
			{ name: 'Variable', value: 'variable' }
		]);

		this.fields
			?.get('triggerGetter-type')
			?.enableHiddenMode?.()
			?.relate?.([
				{ case: 'variable', targets: [this.fields?.get('triggerGetter-variable')?.root] }
			]);
	},
	open(target: AccessorTarget) {
		useTriggerGetterWindow().open(target);
	},
	confirm() {
		useTriggerGetterWindow().confirm();
	}
});
