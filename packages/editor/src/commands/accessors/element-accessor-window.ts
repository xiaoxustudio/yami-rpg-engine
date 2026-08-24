import { $ } from '@app/utils/dom';
import { useElementGetterWindow } from '@app/composables/useElementGetterWindow';
import { PresetElement } from '@app/composables/usePresetElementWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const ElementGetter = createAccessor({
	initialize() {
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
	},
	open(target: AccessorTarget) {
		useElementGetterWindow().open(target, { presetId: PresetElement.getDefaultPresetId() });
	},
	checkDataForPlugin: (data: unknown) =>
		data instanceof Object && (data as { getter?: string }).getter === 'element',
	createDefaultForPlugin: () => ({ getter: 'element', type: 'trigger' }),
	confirm() {
		useElementGetterWindow().confirm();
	}
});
