import { $, getElementReader } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, write } from '@/util/element-utils';
import { PresetObject } from '@/tools/scene-preset-window.ts';
import { AccessorBaseShape } from '@/types/legacy-shapes.ts';

interface PositionGetterTarget {
	dataValue: PositionData;
	read?: () => PositionData;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface PositionData {
	type: 'absolute' | 'relative' | 'actor' | 'trigger' | 'light' | 'region' | 'object' | 'mouse';
	x?: number;
	y?: number;
	actor?: { type: string };
	trigger?: { type: string };
	light?: { type: string };
	region?: { type: string };
	mode?: string;
	objectId?: string;
}

interface PositionGetterShape extends AccessorBaseShape {
	target: PositionGetterTarget | null;
	open: ((target: PositionGetterTarget) => void) | null;
	checkDataForPlugin: ((data: unknown) => boolean) | null;
	createDefaultForPlugin: (() => { getter: string; type: string; x: number; y: number }) | null;
}

export const PositionGetter: PositionGetterShape = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

PositionGetter.initialize = function (this: typeof PositionGetter): void {
	if (!$('#positionGetter-type')) return;
	$('#positionGetter-type').loadItems([
		{ name: 'Absolute Coordinates', value: 'absolute' },
		{ name: 'Relative Coordinates', value: 'relative' },
		{ name: 'Position of Actor', value: 'actor' },
		{ name: 'Position of Trigger', value: 'trigger' },
		{ name: 'Position of Light', value: 'light' },
		{ name: 'Position of Region', value: 'region' },
		{ name: 'Position of Object', value: 'object' },
		{ name: 'Position of Mouse', value: 'mouse' }
	]);

	$('#positionGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'absolute',
				targets: [$('#positionGetter-common-x'), $('#positionGetter-common-y')]
			},
			{
				case: 'relative',
				targets: [$('#positionGetter-common-x'), $('#positionGetter-common-y')]
			},
			{ case: 'actor', targets: [$('#positionGetter-actor')] },
			{ case: 'trigger', targets: [$('#positionGetter-trigger')] },
			{ case: 'light', targets: [$('#positionGetter-light')] },
			{
				case: 'region',
				targets: [$('#positionGetter-region'), $('#positionGetter-region-mode')]
			},
			{ case: 'object', targets: [$('#positionGetter-objectId')] }
		]);

	$('#positionGetter-region-mode').loadItems([
		{ name: 'Center', value: 'center' },
		{ name: 'Random', value: 'random' },
		{ name: 'Random - Land', value: 'random-land' },
		{ name: 'Random - Water', value: 'random-water' },
		{ name: 'Random - Wall', value: 'random-wall' }
	]);

	$('#positionGetter-confirm').addEventListener('click', this.confirm!);
};

PositionGetter.open = function (this: PositionGetterShape, target: PositionGetterTarget): void {
	this.target = target;
	Window.open!('positionGetter');

	let commonX = 0;
	let commonY = 0;
	let actor = { type: 'trigger' };
	let trigger = { type: 'trigger' };
	let light = { type: 'trigger' };
	let region = { type: 'trigger' };
	let regionMode = 'center';
	let objectId = PresetObject.getDefaultPresetId!('any');
	const position = target.read?.();
	switch (position.type) {
		case 'absolute':
			commonX = position.x!;
			commonY = position.y!;
			break;
		case 'relative':
			commonX = position.x!;
			commonY = position.y!;
			break;
		case 'actor':
			actor = position.actor!;
			break;
		case 'trigger':
			trigger = position.trigger!;
			break;
		case 'light':
			light = position.light!;
			break;
		case 'region':
			region = position.region!;
			regionMode = position.mode!;
			break;
		case 'object':
			objectId = position.objectId!;
			break;
	}
	write($('#positionGetter-type'), position.type);
	write($('#positionGetter-common-x'), commonX);
	write($('#positionGetter-common-y'), commonY);
	write($('#positionGetter-actor'), actor);
	write($('#positionGetter-trigger'), trigger);
	write($('#positionGetter-light'), light);
	write($('#positionGetter-region'), region);
	write($('#positionGetter-region-mode'), regionMode);
	write($('#positionGetter-objectId'), objectId);
	getFocus($('#positionGetter-type'));
};

PositionGetter.checkDataForPlugin = function (this: typeof PositionGetter, data: unknown): boolean {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'position';
	}
	return false;
};

PositionGetter.createDefaultForPlugin = function (this: typeof PositionGetter): {
	getter: string;
	type: string;
	x: number;
	y: number;
} {
	return { getter: 'position', type: 'absolute', x: 0, y: 0 };
};

PositionGetter.confirm = function (this: PositionGetterShape, event: Event): void {
	const read = getElementReader('positionGetter');
	const type = read('type');
	let getter: Record<string, unknown> | undefined;
	switch (type) {
		case 'absolute': {
			const x = read('common-x');
			const y = read('common-y');
			getter = { type, x, y };
			break;
		}
		case 'relative': {
			const x = read('common-x');
			const y = read('common-y');
			getter = { type, x, y };
			break;
		}
		case 'actor': {
			const actor = read('actor');
			getter = { type, actor };
			break;
		}
		case 'trigger': {
			const trigger = read('trigger');
			getter = { type, trigger };
			break;
		}
		case 'light': {
			const light = read('light');
			getter = { type, light };
			break;
		}
		case 'region': {
			const region = read('region');
			const mode = read('region-mode');
			getter = { type, region, mode };
			break;
		}
		case 'object': {
			const objectId = read('objectId');
			if (objectId === '') {
				return getFocus($('#positionGetter-objectId'));
			}
			getter = { type, objectId };
			break;
		}
		case 'mouse':
			getter = { type };
			break;
	}
	if (this.target!.isPluginInput) {
		getter = { getter: 'position', ...getter! };
	}
	this.target!.input(getter!);
	Window.close!('positionGetter');
}.bind(PositionGetter);
