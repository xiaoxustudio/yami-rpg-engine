import { $, getElementReader } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { write, getFocus } from '@/util/element-utils.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Enum } from '@/enum/enum-window.ts';
import { AccessorBaseShape, AccessorTarget } from '@/types/legacy-shapes.ts';

interface ItemGetterShape extends AccessorBaseShape {
	checkDataForPlugin: ((data: unknown) => boolean) | null;
	createDefaultForPlugin: (() => { getter: string; type: string }) | null;
}

export const ItemGetter: ItemGetterShape = {
	target: null,
	initialize: null,
	open: null,
	checkDataForPlugin: null,
	createDefaultForPlugin: null,
	confirm: null
};

ItemGetter.initialize = function (this: ItemGetterShape) {
	if (!$('#itemGetter-type')) return;
	$('#itemGetter-type').loadItems([
		{ name: 'Event Trigger Item', value: 'trigger' },
		{ name: 'Latest Item', value: 'latest' },
		{ name: 'By Shortcut Key', value: 'by-key' },
		{ name: 'By Item ID', value: 'by-id' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#itemGetter-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'by-key',
				targets: [$('#itemGetter-actor'), $('#itemGetter-key')]
			},
			{
				case: 'by-id',
				targets: [$('#itemGetter-actor'), $('#itemGetter-itemId')]
			},
			{ case: 'variable', targets: [$('#itemGetter-variable')] }
		]);

	$('#itemGetter-confirm').on('click', this.confirm);
};

ItemGetter.open = function (this: ItemGetterShape, target: AccessorTarget) {
	this.target = target;
	Window.open!('itemGetter');

	$('#itemGetter-key').loadItems(Enum.getStringItems('shortcut-key'));

	let actor = { type: 'trigger' };
	let key = Enum.getDefStringId('shortcut-key');
	let itemId = '';
	let variable = { type: 'local', key: '' };
	const item = target.read?.();
	switch (item.type) {
		case 'trigger':
		case 'latest':
			break;
		case 'by-key':
			actor = item.actor;
			key = item.key;
			break;
		case 'by-id':
			actor = item.actor;
			itemId = item.itemId;
			break;
		case 'variable':
			variable = item.variable;
			break;
	}
	write($('#itemGetter-type'), item.type);
	write($('#itemGetter-actor'), actor);
	write($('#itemGetter-key'), key);
	write($('#itemGetter-itemId'), itemId);
	write($('#itemGetter-variable'), variable);
	getFocus($('#itemGetter-type'));
};

ItemGetter.checkDataForPlugin = function (this: ItemGetterShape, data: unknown) {
	if (data instanceof Object) {
		return (data as { getter?: string }).getter === 'item';
	}
	return false;
};

ItemGetter.createDefaultForPlugin = function (this: ItemGetterShape) {
	return { getter: 'item', type: 'trigger' };
};

ItemGetter.confirm = function (this: ItemGetterShape, event: Event) {
	const read = getElementReader('itemGetter');
	const type = read('type');
	let getter;
	switch (type) {
		case 'trigger':
		case 'latest':
			getter = { type };
			break;
		case 'by-key': {
			const actor = read('actor');
			const key = read('key');
			if (key === '') {
				return getFocus($('#itemGetter-key'));
			}
			getter = { type, actor, key };
			break;
		}
		case 'by-id': {
			const actor = read('actor');
			const itemId = read('itemId');
			if (itemId === '') {
				return getFocus($('#itemGetter-itemId'));
			}
			getter = { type, actor, itemId };
			break;
		}
		case 'variable': {
			const variable = read('variable');
			if (VariableGetter.isNone(variable)) {
				return getFocus($('#itemGetter-variable'));
			}
			getter = { type, variable };
			break;
		}
	}
	if (this.target!.isPluginInput) {
		getter = { getter: 'item', ...getter };
	}
	this.target?.input?.(getter!);
	Window.close!('itemGetter');
}.bind(ItemGetter);
