import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { useAncestorGetterWindow } from '@app/composables/useAncestorGetterWindow';
import { PresetElement } from '@app/composables/usePresetElementWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const AncestorGetter = createAccessor(
	{
		initialize() {
			if (!$('#ancestorGetter-type')) return;
			const inclusions = new Set(['trigger', 'latest', 'by-id', 'variable']);
			$('#ancestorGetter-type').loadItems(
				$('#elementGetter-type').dataItems?.filter((a) =>
					inclusions.has((a as { value: string }).value)
				)
			);

			$('#ancestorGetter-type')
				.enableHiddenMode()
				.relate([
					{ case: 'by-id', targets: [$('#ancestorGetter-presetId')] },
					{ case: 'variable', targets: [$('#ancestorGetter-variable')] }
				]);

			on($('#ancestorGetter-confirm'), 'click', this.confirm!);
		},
		open(target: AccessorTarget) {
			useAncestorGetterWindow().open(target, {
				presetId: PresetElement.getDefaultPresetId()
			});
		},
		confirm() {
			useAncestorGetterWindow().confirm();
		}
	},
	{ dependsOn: ['ElementGetter'] }
);
