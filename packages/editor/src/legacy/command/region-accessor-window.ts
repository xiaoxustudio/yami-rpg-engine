import { $ } from '@app/utils/dom';
import { useRegionGetterWindow } from '@app/composables/useRegionGetterWindow';
import { PresetObject } from '@app/legacy/tools/scene-preset-window.ts';
import { AccessorBaseShape } from '@app/legacy/types/legacy-shapes.ts';

interface RegionTarget {
	dataValue: {
		type: string;
		presetId: string;
	};
	read?: () => { type: string; presetId: string };
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

export const RegionGetter: AccessorBaseShape = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

RegionGetter.initialize = function (this: typeof RegionGetter) {
	if (!$('#regionGetter-type')) return;
	$('#regionGetter-type').loadItems([
		{ name: 'Event Trigger Region', value: 'trigger' },
		{ name: 'By Region ID', value: 'by-id' }
	]);

	$('#regionGetter-type')
		.enableHiddenMode()
		.relate([{ case: 'by-id', targets: [$('#regionGetter-presetId')] }]);
};

RegionGetter.open = function (this: typeof RegionGetter, target: RegionTarget) {
	this.target = target;
	useRegionGetterWindow().open(target, { presetId: PresetObject.getDefaultPresetId('region') });
};

RegionGetter.confirm = function (this: typeof RegionGetter, event: Event) {
	useRegionGetterWindow().confirm();
};
