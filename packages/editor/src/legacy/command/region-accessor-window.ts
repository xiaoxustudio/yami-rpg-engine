import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils.ts';
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

export interface RegionGetterForm {
	type: string;
	presetId: string;
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
	Window.open!('regionGetter');

	let presetId = PresetObject.getDefaultPresetId('region');
	const region = target.read?.()!;
	switch (region.type) {
		case 'trigger':
			break;
		case 'by-id':
			presetId = region.presetId;
			break;
	}
	const setForm = (
		$('#regionGetter') as
			| (HTMLElement & { setForm?: (data: Partial<RegionGetterForm>) => void })
			| null
	)?.setForm;
	setForm?.({ type: region.type, presetId });
	getFocus($('#regionGetter-type'));
};

RegionGetter.confirm = function (this: typeof RegionGetter, event: Event) {
	const getForm = (
		$('#regionGetter') as (HTMLElement & { getForm?: () => RegionGetterForm }) | null
	)?.getForm;
	const { type, presetId } = getForm?.() ?? ({} as RegionGetterForm);
	let getter: Record<string, unknown> | undefined;
	switch (type) {
		case 'trigger':
			getter = { type };
			break;
		case 'by-id': {
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
