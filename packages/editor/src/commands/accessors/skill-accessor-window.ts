import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils';
import { useSkillGetterWindow } from '@app/composables/useSkillGetterWindow';
import { Enum } from '@app/enum/enum-window.ts';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const SkillGetter = createAccessor({
	initialize() {
		if (!$('#skillGetter-type')) return;
		$('#skillGetter-type').loadItems([
			{ name: 'Event Trigger Skill', value: 'trigger' },
			{ name: 'Latest Skill', value: 'latest' },
			{ name: 'By Shortcut Key', value: 'by-key' },
			{ name: 'By Skill ID', value: 'by-id' },
			{ name: 'Variable', value: 'variable' }
		]);

		$('#skillGetter-type')
			.enableHiddenMode()
			.relate([
				{
					case: 'by-key',
					targets: [$('#skillGetter-actor'), $('#skillGetter-key')]
				},
				{
					case: 'by-id',
					targets: [$('#skillGetter-actor'), $('#skillGetter-skillId')]
				},
				{ case: 'variable', targets: [$('#skillGetter-variable')] }
			]);

		on($('#skillGetter-confirm'), 'click', this.confirm!);
	},
	open(target: AccessorTarget) {
		const key = Enum.getDefStringId('shortcut-key');
		$('#skillGetter-key').loadItems(Enum.getStringItems('shortcut-key'));
		useSkillGetterWindow().open(target, { key });
	},
	checkDataForPlugin: (data: unknown) =>
		data instanceof Object && (data as { getter?: string }).getter === 'skill',
	createDefaultForPlugin: () => ({ getter: 'skill', type: 'trigger' }),
	confirm() {
		useSkillGetterWindow().confirm();
	}
});
