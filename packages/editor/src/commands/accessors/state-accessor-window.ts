import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils';
import { useStateGetterWindow } from '@app/composables/useStateGetterWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const StateGetter = createAccessor({
	initialize() {
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
	},
	open(target: AccessorTarget) {
		useStateGetterWindow().open(target);
	},
	checkDataForPlugin: (data: unknown) =>
		data instanceof Object && (data as { getter?: string }).getter === 'state',
	createDefaultForPlugin: () => ({ getter: 'state', type: 'trigger' }),
	confirm() {
		useStateGetterWindow().confirm();
	}
});
