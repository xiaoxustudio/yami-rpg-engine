import '@app/legacy/module/command/deleteActor.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteActorCommandSchema() {
	return useCommandSchema('deleteActor', {
		onLoad() {
			getFocus(document.getElementById('deleteActor-actor')!);
		}
	});
}
