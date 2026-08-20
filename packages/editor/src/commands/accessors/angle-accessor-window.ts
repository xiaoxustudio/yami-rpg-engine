import { $ } from '@app/utils/dom';
import { useAngleGetterWindow } from '@app/composables/useAngleGetterWindow';
import { AccessorBaseShape } from '@app/legacy/types/legacy-shapes.ts';

interface AngleTarget {
	dataValue: {
		type: string;
		position: { type: string; actor: { type: string } };
		degrees: number;
	};
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

export const AngleGetter: AccessorBaseShape = {
	target: null,
	initialize: null,
	open: null,
	confirm: null
};

AngleGetter.initialize = function (this: typeof AngleGetter) {
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
};

AngleGetter.open = function (this: typeof AngleGetter, target: AngleTarget) {
	this.target = target;
	useAngleGetterWindow().open(target);
};

AngleGetter.confirm = function (this: typeof AngleGetter, event: Event) {
	useAngleGetterWindow().confirm();
};
