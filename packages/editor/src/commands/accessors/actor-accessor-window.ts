import { $ } from '@app/utils/dom';
import { useActorGetterWindow } from '@app/composables/useActorGetterWindow';
import { PresetObject } from '@app/composables/usePresetObjectWindow';
import type { AccessorTarget } from '@app/types/shapes.ts';
import { createAccessor } from './accessor-factory.ts';

export const ActorGetter = createAccessor({
	initialize() {
		if (!$('#actorGetter-type')) return;
		$('#actorGetter-type').loadItems([
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

		$('#actorGetter-type')
			.enableHiddenMode()
			.relate([
				{ case: 'member', targets: [$('#actorGetter-memberId')] },
				{ case: 'global', targets: [$('#actorGetter-actorId')] },
				{ case: 'by-id', targets: [$('#actorGetter-presetId')] },
				{ case: 'variable', targets: [$('#actorGetter-variable')] }
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
