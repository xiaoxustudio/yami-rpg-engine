import { useAngleGetterWindow } from '@app/composables/useAngleGetterWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const AngleGetter = createAccessor({
	initialize() {
		if (!this.fields?.get('angleGetter-type')) return;
		this.fields?.get('angleGetter-type')?.loadItems?.([
			{ name: 'Towards Position', value: 'position' },
			{ name: 'Absolute Angle', value: 'absolute' },
			{ name: 'Relative Angle', value: 'relative' },
			{ name: 'Direction Angle', value: 'direction' },
			{ name: 'Random Angle', value: 'random' }
		]);

		this.fields
			?.get('angleGetter-type')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: 'position',
					targets: [this.fields?.get('angleGetter-position-position')?.root]
				},
				{
					case: ['absolute', 'relative', 'direction'],
					targets: [this.fields?.get('angleGetter-common-degrees')?.root]
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
