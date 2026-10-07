import { useActorGetterWindow } from '@app/composables/useActorGetterWindow';
import { PresetObject } from '@app/composables/usePresetObjectWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const ActorGetter = createAccessor({
	initialize() {
		if (!this.fields?.get('actorGetter-type')) return;
		this.fields?.get('actorGetter-type')?.loadItems?.([
			{ name: 'Event Trigger Actor', value: 'trigger' },
			{ name: 'Skill Caster', value: 'caster' },
			{ name: 'Latest Actor', value: 'latest' },
			{ name: 'Target Actor', value: 'target' },
			{ name: 'Player Actor', value: 'player' },
			{ name: 'Party Member', value: 'member' },
			{ name: 'Global Actor', value: 'global' },
			{ name: 'By Actor ID', value: 'by-id' },
			{ name: 'Variable', value: 'variable' }
		]);

		this.fields
			?.get('actorGetter-type')
			?.enableHiddenMode?.()
			?.relate?.([
				{ case: 'member', targets: [this.fields?.get('actorGetter-memberId')?.root] },
				{ case: 'global', targets: [this.fields?.get('actorGetter-actorId')?.root] },
				{ case: 'by-id', targets: [this.fields?.get('actorGetter-presetId')?.root] },
				{ case: 'variable', targets: [this.fields?.get('actorGetter-variable')?.root] }
			]);
	},
	open(target: AccessorTarget) {
		useActorGetterWindow().open(target, {
			presetId: PresetObject.getDefaultPresetId('actor')
		});
	},
	checkDataForPlugin: (data: unknown) =>
		data instanceof Object && (data as { getter?: string }).getter === 'actor',
	createDefaultForPlugin: () => ({ getter: 'actor', type: 'trigger' }),
	confirm() {
		useActorGetterWindow().confirm();
	}
});
