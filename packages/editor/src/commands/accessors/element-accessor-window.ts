import { $ } from '@app/utils/dom';
import { useElementGetterWindow } from '@app/composables/useElementGetterWindow';
import { PresetElement } from '@app/composables/usePresetElementWindow';
import { AccessorBaseShape } from '@app/types/shapes.ts';

interface ElementGetterTarget {
	dataValue: ElementData;
	read?: () => ElementData;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

interface ElementData {
	type:
		| 'trigger'
		| 'latest'
		| 'by-id'
		| 'by-ancestor-and-id'
		| 'by-index'
		| 'by-button-index'
		| 'selected-button'
		| 'focus'
		| 'parent'
		| 'variable';
	presetId?: string;
	ancestor?: { type: string };
	parent?: { type: string };
	focus?: { type: string };
	index?: number;
	variable?: { type: string; key: string };
}

interface ElementGetterShape extends AccessorBaseShape {
	target: ElementGetterTarget | null;
	open: ((target: ElementGetterTarget) => void) | null;
	checkDataForPlugin: ((data: unknown) => boolean) | null;
	createDefaultForPlugin: (() => { getter: string; type: string }) | null;
}

export const ElementGetter: ElementGetterShape = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

ElementGetter.initialize = function (this: typeof ElementGetter): void {
	if (!$('#elementGetter-type')) return;
	$('#elementGetter-type').loadItems([
		{ name: 'Event Trigger Element', value: 'trigger' },
		{ name: 'Latest Element', value: 'latest' },
		{ name: 'By Element ID', value: 'by-id' },
		{ name: 'By Ancestor And ID', value: 'by-ancestor-and-id' },
		{ name: 'By Parent And Index', value: 'by-index' },
		{ name: 'By Focus And Button Index', value: 'by-button-index' },
		{ name: 'Get Selected Button In Focus', value: 'selected-button' },
		{ name: 'Get The Latest Focus Element', value: 'focus' },
		{ name: 'Get Parent Element', value: 'parent' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#elementGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'by-id', targets: [$('#elementGetter-presetId')] },
			{
				case: 'by-ancestor-and-id',
				targets: [$('#elementGetter-ancestor'), $('#elementGetter-presetId')]
			},
			{
				case: ['by-index', 'by-button-index'],
				targets: [$('#elementGetter-ancestor'), $('#elementGetter-index')]
			},
			{
				case: 'selected-button',
				targets: [$('#elementGetter-ancestor')]
			},
			{
				case: ['parent', 'variable'],
				targets: [$('#elementGetter-variable')]
			}
		]);
};

ElementGetter.open = function (this: ElementGetterShape, target: ElementGetterTarget): void {
	this.target = target;
	useElementGetterWindow().open(target, { presetId: PresetElement.getDefaultPresetId() });
};

ElementGetter.checkDataForPlugin = function (this: typeof ElementGetter, data: unknown): boolean {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'element';
	}
	return false;
};

ElementGetter.createDefaultForPlugin = function (this: typeof ElementGetter): {
	getter: string;
	type: string;
} {
	return { getter: 'element', type: 'trigger' };
};

ElementGetter.confirm = function (this: ElementGetterShape, event: Event): void {
	useElementGetterWindow().confirm();
};
