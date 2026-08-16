import '@/module/command/deleteGlobalActor.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteGlobalActorCommandSchema() {
	return useCommandSchema('deleteGlobalActor', {
		onLoad() {
			getFocus($('#deleteGlobalActor-actorId'));
		}
	});
}
