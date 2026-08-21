import { $ } from '@app/utils/dom';
import { usePositionGetterWindow } from '@app/composables/usePositionGetterWindow';
import { PresetObject } from '@app/composables/usePresetObjectWindow';
import { AccessorBaseShape } from '@app/types/shapes.ts';

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
};

PositionGetter.open = function (this: PositionGetterShape, target: PositionGetterTarget): void {
	this.target = target;
	usePositionGetterWindow().open(target, { objectId: PresetObject.getDefaultPresetId('any') });
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
	usePositionGetterWindow().confirm();
};
