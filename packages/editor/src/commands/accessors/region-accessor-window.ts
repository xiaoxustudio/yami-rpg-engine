import { useRegionGetterWindow } from '@app/composables/useRegionGetterWindow';
import { PresetObject } from '@app/composables/usePresetObjectWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const RegionGetter = createAccessor({
	initialize() {
		if (!this.fields?.get('regionGetter-type')) return;
		this.fields?.get('regionGetter-type')?.loadItems?.([
			{ name: 'Event Trigger Region', value: 'trigger' },
			{ name: 'By Region ID', value: 'by-id' }
		]);

		this.fields
			?.get('regionGetter-type')
			?.enableHiddenMode?.()
			?.relate?.([
				{ case: 'by-id', targets: [this.fields?.get('regionGetter-presetId')?.root] }
			]);
	},
	open(target: AccessorTarget) {
		useRegionGetterWindow().open(target, {
			presetId: PresetObject.getDefaultPresetId('region')
		});
	},
	confirm() {
		useRegionGetterWindow().confirm();
	}
});
