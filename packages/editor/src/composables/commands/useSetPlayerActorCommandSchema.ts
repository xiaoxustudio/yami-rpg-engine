import '@/module/command/setPlayerActor.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetPlayerActorCommandSchema() {
	return useCommandSchema('setPlayerActor', {
		onLoad() {
			getFocus($('#setPlayerActor-actor'));
		}
	});
}
