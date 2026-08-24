import { $ } from '@app/utils/dom';
import { useRegionGetterWindow } from '@app/composables/useRegionGetterWindow';
import { PresetObject } from '@app/composables/usePresetObjectWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const RegionGetter = createAccessor({
	initialize() {
		if (!$('#regionGetter-type')) return;
		$('#regionGetter-type').loadItems([
			{ name: 'Event Trigger Region', value: 'trigger' },
			{ name: 'By Region ID', value: 'by-id' }
		]);

		$('#regionGetter-type')
			.enableHiddenMode()
			.relate([{ case: 'by-id', targets: [$('#regionGetter-presetId')] }]);
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
