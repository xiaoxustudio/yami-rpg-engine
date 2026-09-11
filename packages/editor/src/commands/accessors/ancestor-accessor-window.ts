import { useAncestorGetterWindow } from '@app/composables/useAncestorGetterWindow';
import { PresetElement } from '@app/composables/usePresetElementWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const AncestorGetter = createAccessor(
	{
		initialize() {
			if (!this.fields?.get('ancestorGetter-type')) return;
			const inclusions = new Set(['trigger', 'latest', 'by-id', 'variable']);
			this.fields
				?.get('ancestorGetter-type')
				?.loadItems?.(
					this.fields
						?.get('elementGetter-type')
						?.root?.dataItems?.filter((a) =>
							inclusions.has((a as { value: string }).value)
						) ?? []
				);

			this.fields
				?.get('ancestorGetter-type')
				?.enableHiddenMode?.()
				?.relate?.([
					{ case: 'by-id', targets: [this.fields?.get('ancestorGetter-presetId')?.root] },
					{
						case: 'variable',
						targets: [this.fields?.get('ancestorGetter-variable')?.root]
					}
				]);
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
