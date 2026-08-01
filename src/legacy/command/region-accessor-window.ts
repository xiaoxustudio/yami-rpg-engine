import { $, getElementReader } from '@/util/dom.ts';
import { write, getFocus } from '@/util/element-utils.ts';
import { PresetObject } from '@/tools/scene-preset-window.ts';
function getWindow() {
	return (window as any).Window;
}

export const RegionGetter = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

RegionGetter.initialize = function () {
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

RegionGetter.open = function (target) {
	this.target = target;
	getWindow().open('regionGetter');

	let presetId = PresetObject.getDefaultPresetId('region');
	const region = target.dataValue;
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

RegionGetter.confirm = function (event) {
	const read = getElementReader('regionGetter');
	const type = read('type');
	let getter;
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
	this.target.input(getter);
	getWindow().close('regionGetter');
}.bind(RegionGetter);
