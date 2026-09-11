import { useItemGetterWindow } from '@app/composables/useItemGetterWindow';
import { Enum } from '@app/enum/enum-window.ts';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const ItemGetter = createAccessor({
	initialize() {
		if (!this.fields?.get('itemGetter-type')) return;
		this.fields?.get('itemGetter-type')?.loadItems?.([
			{ name: 'Event Trigger Item', value: 'trigger' },
			{ name: 'Latest Item', value: 'latest' },
			{ name: 'By Shortcut Key', value: 'by-key' },
			{ name: 'By Item ID', value: 'by-id' },
			{ name: 'Variable', value: 'variable' }
		]);

		this.fields
			?.get('itemGetter-type')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: 'by-key',
					targets: [
						this.fields?.get('itemGetter-actor')?.root,
						this.fields?.get('itemGetter-key')?.root
					]
				},
				{
					case: 'by-id',
					targets: [
						this.fields?.get('itemGetter-actor')?.root,
						this.fields?.get('itemGetter-itemId')?.root
					]
				},
				{ case: 'variable', targets: [this.fields?.get('itemGetter-variable')?.root] }
			]);
	},
	open(target: AccessorTarget) {
		const key = Enum.getDefStringId('shortcut-key');
		this.fields?.get('itemGetter-key')?.loadItems?.(Enum.getStringItems('shortcut-key'));
		useItemGetterWindow().open(target, { key });
	},
	checkDataForPlugin: (data: unknown) =>
		data instanceof Object && (data as { getter?: string }).getter === 'item',
	createDefaultForPlugin: () => ({ getter: 'item', type: 'trigger' }),
	confirm() {
		useItemGetterWindow().confirm();
	}
});
