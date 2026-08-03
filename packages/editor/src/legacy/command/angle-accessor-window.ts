import { $, getElementReader } from '@/util/dom.ts';
import { write, getFocus } from '@/util/element-utils.ts';
function getWindow() {
	return (window as any).Window;
}

export const AngleGetter = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

AngleGetter.initialize = function () {
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

AngleGetter.open = function (target) {
	this.target = target;
	getWindow().open('angleGetter');

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

AngleGetter.confirm = function (event) {
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
	this.target.input(getter);
	getWindow().close('angleGetter');
}.bind(AngleGetter);
