import { $ } from '@app/utils/dom';
import { useItemGetterWindow } from '@app/composables/useItemGetterWindow';
import { Enum } from '@app/enum/enum-window.ts';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const ItemGetter = createAccessor({
	initialize() {
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
	},
	open(target: AccessorTarget) {
		const key = Enum.getDefStringId('shortcut-key');
		$('#itemGetter-key').loadItems(Enum.getStringItems('shortcut-key'));
		useItemGetterWindow().open(target, { key });
	},
	checkDataForPlugin: (data: unknown) =>
		data instanceof Object && (data as { getter?: string }).getter === 'item',
	createDefaultForPlugin: () => ({ getter: 'item', type: 'trigger' }),
	confirm() {
		useItemGetterWindow().confirm();
	}
});
