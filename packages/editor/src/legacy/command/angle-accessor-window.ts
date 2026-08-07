import { $, getElementReader } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { write, getFocus } from '@/util/element-utils.ts';

export const AngleGetter = {
	target: null as any,
	initialize: null as any,
	open: null as any,
	confirm: null as any
};

AngleGetter.initialize = function (this: any) {
	if (!$('#angleGetter-type')) return;
	$('#angleGetter-type').loadItems([
		{ name: 'Towards Position', value: 'position' },
		{ name: 'Absolute Angle', value: 'absolute' },
		{ name: 'Relative Angle', value: 'relative' },
		{ name: 'Direction Angle', value: 'direction' },
		{ name: 'Random Angle', value: 'random' }
	]);

	$('#angleGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'position',
				targets: [$('#angleGetter-position-position')]
			},
			{
				case: ['absolute', 'relative', 'direction'],
				targets: [$('#angleGetter-common-degrees')]
			}
		]);

	$('#angleGetter-confirm').on('click', this.confirm);
};

AngleGetter.open = function (this: any, target: any) {
	this.target = target;
	Window.open!('angleGetter');

	let positionPosition = { type: 'actor', actor: { type: 'trigger' } };
	let commonDegrees = 0;
	const angle = target.dataValue;
	switch (angle.type) {
		case 'position':
			positionPosition = angle.position;
			break;
		case 'absolute':
		case 'relative':
		case 'direction':
			commonDegrees = angle.degrees;
			break;
		case 'random':
			break;
	}
	write($('#angleGetter-type'), angle.type);
	write($('#angleGetter-position-position'), positionPosition);
	write($('#angleGetter-common-degrees'), commonDegrees);
	getFocus($('#angleGetter-type'));
};

AngleGetter.confirm = function (this: any, event: any) {
	const read = getElementReader('angleGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'position': {
			const position = read('position-position');
			getter = { type, position };
			break;
		}
		case 'absolute':
		case 'relative':
		case 'direction': {
			const degrees = read('common-degrees');
			getter = { type, degrees };
			break;
		}
		case 'random':
			getter = { type };
			break;
	}
	this.target?.input?.(getter);
	Window.close!('angleGetter');
}.bind(AngleGetter);
