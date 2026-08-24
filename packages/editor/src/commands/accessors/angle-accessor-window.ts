import { $ } from '@app/utils/dom';
import { useAngleGetterWindow } from '@app/composables/useAngleGetterWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const AngleGetter = createAccessor({
	initialize() {
		if (!$('#angleGetter-type')) return;
		$('#angleGetter-type').loadItems([
			{ name: 'Towards Position', value: 'position' },
			{ name: 'Absolute Angle', value: 'absolute' },
			{ name: 'Relative Angle', value: 'relative' },
			{ name: 'Direction Angle', value: 'direction' },
			{ name: 'Random Angle', value: 'random' }
		]);

		$('#angleGetter-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'position',
					targets: [$('#angleGetter-position-position')]
				},
				{
					case: ['absolute', 'relative', 'direction'],
					targets: [$('#angleGetter-common-degrees')]
				}
			]);
	},
	open(target: AccessorTarget) {
		useAngleGetterWindow().open(target);
	},
	confirm() {
		useAngleGetterWindow().confirm();
	}
});
