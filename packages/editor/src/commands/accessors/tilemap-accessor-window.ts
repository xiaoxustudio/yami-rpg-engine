import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { useTilemapGetterWindow } from '@app/composables/useTilemapGetterWindow';
import { PresetObject } from '@app/composables/usePresetObjectWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const TilemapGetter = createAccessor({
	initialize() {
		if (!$('#tilemapGetter-type')) return;
		$('#tilemapGetter-type').loadItems([
			{ name: 'Event Trigger Tilemap', value: 'trigger' },
			{ name: 'By Tilemap ID', value: 'by-id' },
			{ name: 'Variable', value: 'variable' }
		]);

		$('#tilemapGetter-type')
			.enableHiddenMode()
			.relate([
				{ case: 'by-id', targets: [$('#tilemapGetter-presetId')] },
				{ case: 'variable', targets: [$('#tilemapGetter-variable')] }
			]);

		on($('#tilemapGetter-confirm'), 'click', this.confirm!);
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
