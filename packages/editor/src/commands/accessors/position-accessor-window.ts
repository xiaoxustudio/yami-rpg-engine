import { usePositionGetterWindow } from '@app/composables/usePositionGetterWindow';
import { PresetObject } from '@app/composables/usePresetObjectWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const PositionGetter = createAccessor({
	initialize() {
		if (!this.fields?.get('positionGetter-type')) return;
		this.fields?.get('positionGetter-type')?.loadItems?.([
			{ name: 'Absolute Coordinates', value: 'absolute' },
			{ name: 'Relative Coordinates', value: 'relative' },
			{ name: 'Position of Actor', value: 'actor' },
			{ name: 'Position of Trigger', value: 'trigger' },
			{ name: 'Position of Light', value: 'light' },
			{ name: 'Position of Region', value: 'region' },
			{ name: 'Position of Object', value: 'object' },
			{ name: 'Position of Mouse', value: 'mouse' }
		]);

		this.fields
			?.get('positionGetter-type')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: 'absolute',
					targets: [
						this.fields?.get('positionGetter-common-x')?.root,
						this.fields?.get('positionGetter-common-y')?.root
					]
				},
				{
					case: 'relative',
					targets: [
						this.fields?.get('positionGetter-common-x')?.root,
						this.fields?.get('positionGetter-common-y')?.root
					]
				},
				{ case: 'actor', targets: [this.fields?.get('positionGetter-actor')?.root] },
				{ case: 'trigger', targets: [this.fields?.get('positionGetter-trigger')?.root] },
				{ case: 'light', targets: [this.fields?.get('positionGetter-light')?.root] },
				{
					case: 'region',
					targets: [
						this.fields?.get('positionGetter-region')?.root,
						this.fields?.get('positionGetter-region-mode')?.root
					]
				},
				{ case: 'object', targets: [this.fields?.get('positionGetter-objectId')?.root] }
			]);

		this.fields?.get('positionGetter-region-mode')?.loadItems?.([
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
