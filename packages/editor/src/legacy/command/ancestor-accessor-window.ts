import { $, getElementReader } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, on, write } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { PresetElement } from '@/tools/preset-element-window.ts';
import { AccessorBaseShape } from '@/types/legacy-shapes.ts';

interface AncestorGetterShape extends AccessorBaseShape {
	dependsOn: string[];
}

export const AncestorGetter: AncestorGetterShape = {
	target: null,
	dependsOn: ['ElementGetter'],
	initialize: null,
	open: null,
	confirm: null
};

AncestorGetter.initialize = function (this: any) {
	if (!$('#ancestorGetter-type')) return;
	const inclusions = new Set(['trigger', 'latest', 'by-id', 'variable']);
	$('#ancestorGetter-type').loadItems(
		$('#elementGetter-type').dataItems?.filter((a: any) => inclusions.has(a.value))
	);

	$('#ancestorGetter-type')
		.enableHiddenMode()
		.relate([
			{ case: 'by-id', targets: [$('#ancestorGetter-presetId')] },
			{ case: 'variable', targets: [$('#ancestorGetter-variable')] }
		]);

	on($('#ancestorGetter-confirm'), 'click', this.confirm);
};

AncestorGetter.open = function (this: any, target: any) {
	this.target = target;
	Window.open!('ancestorGetter');

	let presetId = PresetElement.getDefaultPresetId!();
	let variable = { type: 'local', key: '' };
	const element = target.dataValue;
	switch (element.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-id':
			presetId = element.presetId;
			break;
		case 'variable':
			variable = element.variable;
			break;
	}
	write($('#ancestorGetter-type'), element.type);
	write($('#ancestorGetter-presetId'), presetId);
	write($('#ancestorGetter-variable'), variable);
	getFocus($('#ancestorGetter-type'));
};

AncestorGetter.confirm = function (this: any, event: any) {
	const read = getElementReader('ancestorGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-id': {
			const presetId = read('presetId');
			if (presetId === '') {
				return getFocus($('#ancestorGetter-presetId'));
			}
			getter = { type, presetId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return getFocus($('#ancestorGetter-variable'));
			}
			getter = { type, variable };
			break;
		}
	}
	this.target?.input?.(getter);
	Window.close!('ancestorGetter');
}.bind(AncestorGetter);
