import '@app/legacy/module/command/setPlayerActor.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetPlayerActorCommandSchema() {
	return useCommandSchema('setPlayerActor', {
		onLoad() {
			getFocus(document.getElementById('setPlayerActor-actor'));
		}
	});
}
