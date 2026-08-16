import '@/module/command/deleteActor.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDeleteActorCommandSchema() {
	return useCommandSchema('deleteActor', {
		onLoad() {
			getFocus($('#deleteActor-actor'));
		}
	});
}
