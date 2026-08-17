import '@app/legacy/module/command/deleteGlobalActor.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteGlobalActorCommandSchema() {
	return useCommandSchema('deleteGlobalActor', {
		onLoad() {
			getFocus($('#deleteGlobalActor-actorId'));
		}
	});
}
