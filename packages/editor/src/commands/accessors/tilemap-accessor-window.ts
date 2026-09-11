import { useTilemapGetterWindow } from '@app/composables/useTilemapGetterWindow';
import { PresetObject } from '@app/composables/usePresetObjectWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const TilemapGetter = createAccessor({
	initialize() {
		if (!this.fields?.get('tilemapGetter-type')) return;
		this.fields?.get('tilemapGetter-type')?.loadItems?.([
			{ name: 'Event Trigger Tilemap', value: 'trigger' },
			{ name: 'By Tilemap ID', value: 'by-id' },
			{ name: 'Variable', value: 'variable' }
		]);

		this.fields
			?.get('tilemapGetter-type')
			?.enableHiddenMode?.()
			?.relate?.([
				{ case: 'by-id', targets: [this.fields?.get('tilemapGetter-presetId')?.root] },
				{ case: 'variable', targets: [this.fields?.get('tilemapGetter-variable')?.root] }
			]);
	},
	open(target: AccessorTarget) {
		useTilemapGetterWindow().open(target, {
			presetId: PresetObject.getDefaultPresetId('tilemap')
		});
	},
	confirm() {
		useTilemapGetterWindow().confirm();
	}
});
