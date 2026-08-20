import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils.ts';
import { useAncestorGetterWindow } from '@app/composables/useAncestorGetterWindow';
import { PresetElement } from '@app/legacy/tools/preset-element-window.ts';
import { AccessorBaseShape, AccessorTarget } from '@app/legacy/types/legacy-shapes.ts';

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

AncestorGetter.initialize = function (this: AncestorGetterShape) {
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
};

AncestorGetter.open = function (this: AncestorGetterShape, target: AccessorTarget) {
	this.target = target;
	useAncestorGetterWindow().open(target, { presetId: PresetElement.getDefaultPresetId() });
};

AncestorGetter.confirm = function (this: AncestorGetterShape, event: Event) {
	useAncestorGetterWindow().confirm();
};
