import { $, getElementReader } from '@/util/dom.ts';
import { getFocus, on, write } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { PresetObject } from '@/tools/scene-preset-window.ts';
function getWindow() {
	return (window as any).Window;
}

export const TilemapGetter = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

TilemapGetter.initialize = function () {
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

	on($('#tilemapGetter-confirm'), 'click', this.confirm);
};

TilemapGetter.open = function (target) {
	this.target = target;
	getWindow().open('tilemapGetter');

	let presetId = PresetObject.getDefaultPresetId('tilemap');
	let variable = { type: 'local', key: '' };
	const tilemap = target.dataValue;
	switch (tilemap.type) {
		case 'trigger':
			break;
		case 'by-id':
			presetId = tilemap.presetId;
			break;
		case 'variable':
			variable = tilemap.variable;
			break;
	}
	write($('#tilemapGetter-type'), tilemap.type);
	write($('#tilemapGetter-presetId'), presetId);
	write($('#tilemapGetter-variable'), variable);
	getFocus($('#tilemapGetter-type'));
};

TilemapGetter.confirm = function (event) {
	const read = getElementReader('tilemapGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
			getter = { type };
			break;
		case 'by-id': {
			const presetId = read('presetId');
			if (presetId === '') {
				return getFocus($('#tilemapGetter-presetId'));
			}
			getter = { type, presetId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return getFocus($('#tilemapGetter-variable'));
			}
			getter = { type, variable };
			break;
		}
	}
	this.target.input(getter);
	getWindow().close('tilemapGetter');
}.bind(TilemapGetter);
