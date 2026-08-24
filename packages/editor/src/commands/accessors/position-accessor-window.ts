import { $ } from '@app/utils/dom';
import { usePositionGetterWindow } from '@app/composables/usePositionGetterWindow';
import { PresetObject } from '@app/composables/usePresetObjectWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const PositionGetter = createAccessor({
	initialize() {
		if (!$('#positionGetter-type')) return;
		$('#positionGetter-type').loadItems([
			{ name: 'Absolute Coordinates', value: 'absolute' },
			{ name: 'Relative Coordinates', value: 'relative' },
			{ name: 'Position of Actor', value: 'actor' },
			{ name: 'Position of Trigger', value: 'trigger' },
			{ name: 'Position of Light', value: 'light' },
			{ name: 'Position of Region', value: 'region' },
			{ name: 'Position of Object', value: 'object' },
			{ name: 'Position of Mouse', value: 'mouse' }
		]);

		$('#positionGetter-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'absolute',
					targets: [$('#positionGetter-common-x'), $('#positionGetter-common-y')]
				},
				{
					case: 'relative',
					targets: [$('#positionGetter-common-x'), $('#positionGetter-common-y')]
				},
				{ case: 'actor', targets: [$('#positionGetter-actor')] },
				{ case: 'trigger', targets: [$('#positionGetter-trigger')] },
				{ case: 'light', targets: [$('#positionGetter-light')] },
				{
					case: 'region',
					targets: [$('#positionGetter-region'), $('#positionGetter-region-mode')]
				},
				{ case: 'object', targets: [$('#positionGetter-objectId')] }
			]);

		$('#positionGetter-region-mode').loadItems([
			{ name: 'Center', value: 'center' },
			{ name: 'Random', value: 'random' },
			{ name: 'Random - Land', value: 'random-land' },
			{ name: 'Random - Water', value: 'random-water' },
			{ name: 'Random - Wall', value: 'random-wall' }
		]);
	},
	open(target: AccessorTarget) {
		usePositionGetterWindow().open(target, {
			objectId: PresetObject.getDefaultPresetId('any')
		});
	},
	checkDataForPlugin: (data: unknown) =>
		data instanceof Object && (data as { getter?: string }).getter === 'position',
	createDefaultForPlugin: () => ({ getter: 'position', type: 'absolute', x: 0, y: 0 }),
	confirm() {
		usePositionGetterWindow().confirm();
	}
});
