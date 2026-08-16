import '@/module/command/changeActorTeam.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorTeamCommandSchema() {
	return useCommandSchema('changeActorTeam', {
		onLoad() {
			getFocus($('#changeActorTeam-actor'));
		}
	});
}
