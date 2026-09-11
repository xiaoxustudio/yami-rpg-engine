import { useSkillGetterWindow } from '@app/composables/useSkillGetterWindow';
import { Enum } from '@app/enum/enum-window.ts';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const SkillGetter = createAccessor({
	initialize() {
		if (!this.fields?.get('skillGetter-type')) return;
		this.fields?.get('skillGetter-type')?.loadItems?.([
			{ name: 'Event Trigger Skill', value: 'trigger' },
			{ name: 'Latest Skill', value: 'latest' },
			{ name: 'By Shortcut Key', value: 'by-key' },
			{ name: 'By Skill ID', value: 'by-id' },
			{ name: 'Variable', value: 'variable' }
		]);

		this.fields
			?.get('skillGetter-type')
			?.enableHiddenMode?.()
			?.relate?.([
				{
					case: 'by-key',
					targets: [
						this.fields?.get('skillGetter-actor')?.root,
						this.fields?.get('skillGetter-key')?.root
					]
				},
				{
					case: 'by-id',
					targets: [
						this.fields?.get('skillGetter-actor')?.root,
						this.fields?.get('skillGetter-skillId')?.root
					]
				},
				{ case: 'variable', targets: [this.fields?.get('skillGetter-variable')?.root] }
			]);
	},
	open(target: AccessorTarget) {
		const key = Enum.getDefStringId('shortcut-key');
		this.fields?.get('skillGetter-key')?.loadItems?.(Enum.getStringItems('shortcut-key'));
		useSkillGetterWindow().open(target, { key });
	},
	checkDataForPlugin: (data: unknown) =>
		data instanceof Object && (data as { getter?: string }).getter === 'skill',
	createDefaultForPlugin: () => ({ getter: 'skill', type: 'trigger' }),
	confirm() {
		useSkillGetterWindow().confirm();
	}
});
