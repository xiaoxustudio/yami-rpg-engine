import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils';
import { useStateGetterWindow } from '@app/composables/useStateGetterWindow';
import { AccessorBaseShape, AccessorTarget } from '@app/types/legacy-shapes.ts';

interface StateGetterShape extends AccessorBaseShape {
	checkDataForPlugin: ((data: unknown) => boolean) | null;
	createDefaultForPlugin: (() => { getter: string; type: string }) | null;
}

export const StateGetter: StateGetterShape = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

StateGetter.initialize = function (this: StateGetterShape) {
	if (!$('#stateGetter-type')) return;
	$('#stateGetter-type').loadItems([
		{ name: 'Event Trigger State', value: 'trigger' },
		{ name: 'Latest State', value: 'latest' },
		{ name: 'By State ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#stateGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'by-id',
				targets: [$('#stateGetter-actor'), $('#stateGetter-stateId')]
			},
			{ case: 'variable', targets: [$('#stateGetter-variable')] }
		]);

	on($('#stateGetter-confirm'), 'click', this.confirm!);
};

StateGetter.open = function (this: StateGetterShape, target: AccessorTarget) {
	this.target = target;
	useStateGetterWindow().open(target);
};

StateGetter.checkDataForPlugin = function (this: StateGetterShape, data: unknown) {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'state';
	}
	return false;
};

StateGetter.createDefaultForPlugin = function (this: StateGetterShape) {
	return { getter: 'state', type: 'trigger' };
};

StateGetter.confirm = function (this: StateGetterShape, event: Event) {
	useStateGetterWindow().confirm();
};
