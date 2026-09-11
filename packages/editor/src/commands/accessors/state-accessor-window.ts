import { useStateGetterWindow } from '@app/composables/useStateGetterWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const StateGetter = createAccessor({
	initialize() {
		if (!this.fields?.get('stateGetter-type')) return;
		this.fields?.get('stateGetter-type')?.loadItems?.([
			{ name: 'Event Trigger State', value: 'trigger' },
			{ name: 'Latest State', value: 'latest' },
			{ name: 'By State ID', value: 'by-id' },
			{ name: 'Variable', value: 'variable' }
		]);

		this.fields
			?.get('stateGetter-type')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: 'by-id',
					targets: [
						this.fields?.get('stateGetter-actor')?.root,
						this.fields?.get('stateGetter-stateId')?.root
					]
				},
				{ case: 'variable', targets: [this.fields?.get('stateGetter-variable')?.root] }
			]);
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
