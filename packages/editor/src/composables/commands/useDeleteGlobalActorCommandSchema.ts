import '@app/legacy/module/command/deleteGlobalActor.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteGlobalActorCommandSchema() {
	return useCommandSchema('deleteGlobalActor', {
		onLoad() {
			getFocus(document.getElementById('deleteGlobalActor-actorId')!);
		}
	});
}
