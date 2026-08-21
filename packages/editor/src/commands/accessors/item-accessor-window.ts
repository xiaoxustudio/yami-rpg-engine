import { $ } from '@app/utils/dom';
import { useItemGetterWindow } from '@app/composables/useItemGetterWindow';
import { Enum } from '@app/enum/enum-window.ts';
import { AccessorBaseShape, AccessorTarget } from '@app/types/legacy-shapes.ts';

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
};

ItemGetter.open = function (this: ItemGetterShape, target: AccessorTarget) {
	this.target = target;
	const key = Enum.getDefStringId('shortcut-key');
	$('#itemGetter-key').loadItems(Enum.getStringItems('shortcut-key'));
	useItemGetterWindow().open(target, { key });
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
	useItemGetterWindow().confirm();
};
