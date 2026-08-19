import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { useTilemapGetterWindow } from '@app/composables/useTilemapGetterWindow';
import { PresetObject } from '@app/legacy/tools/scene-preset-window.ts';
import { AccessorBaseShape } from '@app/legacy/types/legacy-shapes.ts';

interface TilemapTarget {
	dataValue: {
		type: string;
		presetId: string;
		variable: { type: string; key: string };
	};
	read?: () => { type: string; presetId: string; variable: { type: string; key: string } };
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

export const TilemapGetter: AccessorBaseShape = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

TilemapGetter.initialize = function (this: typeof TilemapGetter) {
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
};

TilemapGetter.open = function (this: typeof TilemapGetter, target: TilemapTarget) {
	this.target = target;
	useTilemapGetterWindow().open(target, { presetId: PresetObject.getDefaultPresetId('tilemap') });
};

TilemapGetter.confirm = function (this: typeof TilemapGetter, event: Event) {
	useTilemapGetterWindow().confirm();
};
