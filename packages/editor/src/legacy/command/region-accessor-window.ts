import { $, getElementReader } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { write, getFocus } from '@/util/element-utils.ts';
import { PresetObject } from '@/tools/scene-preset-window.ts';
import { AccessorBaseShape } from '@/types/legacy-shapes.ts';

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

	$('#regionGetter-confirm').on('click', this.confirm);
};

RegionGetter.open = function (this: typeof RegionGetter, target: RegionTarget) {
	this.target = target;
	Window.open!('regionGetter');

	let presetId = PresetObject.getDefaultPresetId('region');
	const region = target.read?.();
	switch (region.type) {
		case 'trigger':
			break;
		case 'by-id':
			presetId = region.presetId;
			break;
	}
	write($('#regionGetter-type'), region.type);
	write($('#regionGetter-presetId'), presetId);
	getFocus($('#regionGetter-type'));
};

RegionGetter.confirm = function (this: typeof RegionGetter, event: Event) {
	const read = getElementReader('regionGetter');
	const type = read('type');
	let getter: Record<string, unknown> | undefined;
	switch (type) {
		case 'trigger':
			getter = { type };
			break;
		case 'by-id': {
			const presetId = read('presetId');
			if (presetId === '') {
				return getFocus($('#regionGetter-presetId'));
			}
			getter = { type, presetId };
			break;
		}
	}
	this.target?.input?.(getter!);
	Window.close!('regionGetter');
}.bind(RegionGetter);
