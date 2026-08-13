import { $, getElementReader } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { write, getFocus } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { PresetElement } from '@/tools/preset-element-window.ts';
import { AccessorBaseShape } from '@/types/legacy-shapes.ts';

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
	Window.open!('elementGetter');

	let index = 0;
	let presetId = PresetElement.getDefaultPresetId!();
	let ancestor = { type: 'trigger' };
	let variable = { type: 'local', key: '' };
	const element = target.read?.()!;
	switch (element.type) {
		case 'trigger':
		case 'latest':
		case 'focus':
			break;
		case 'by-id':
			presetId = element.presetId!;
			break;
		case 'by-ancestor-and-id':
			ancestor = element.ancestor!;
			presetId = element.presetId!;
			break;
		case 'by-index':
			ancestor = element.parent!;
			index = element.index!;
			break;
		case 'by-button-index':
			ancestor = element.focus!;
			index = element.index!;
			break;
		case 'selected-button':
			ancestor = element.focus!;
			break;
		case 'parent':
		case 'variable':
			variable = element.variable!;
			break;
	}
	write($('#elementGetter-type'), element.type);
	write($('#elementGetter-ancestor'), ancestor);
	write($('#elementGetter-presetId'), presetId);
	write($('#elementGetter-index'), index);
	write($('#elementGetter-variable'), variable);
	getFocus($('#elementGetter-type'));
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
	const read = getElementReader('elementGetter');
	const type = read('type');
	let getter: Record<string, unknown> | undefined;
	switch (type) {
		case 'trigger':
		case 'latest':
		case 'focus':
			getter = { type };
			break;
		case 'by-id': {
			const presetId = read('presetId');
			if (presetId === '') {
				return getFocus($('#elementGetter-presetId'));
			}
			getter = { type, presetId };
			break;
		}
		case 'by-ancestor-and-id': {
			const ancestor = read('ancestor');
			const presetId = read('presetId');
			if (presetId === '') {
				return getFocus($('#elementGetter-presetId'));
			}
			getter = { type, ancestor, presetId };
			break;
		}
		case 'by-index': {
			const parent = read('ancestor');
			const index = read('index');
			getter = { type, parent, index };
			break;
		}
		case 'by-button-index': {
			const focus = read('ancestor');
			const index = read('index');
			getter = { type, focus, index };
			break;
		}
		case 'selected-button': {
			const focus = read('ancestor');
			getter = { type, focus };
			break;
		}
		case 'parent':
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone!(variable)) {
				return getFocus($('#elementGetter-variable'));
			}
			getter = { type, variable };
			break;
		}
	}
	if (this.target!.isPluginInput) {
		getter = { getter: 'element', ...getter! };
	}
	this.target!.input(getter!);
	Window.close!('elementGetter');
}.bind(ElementGetter);
