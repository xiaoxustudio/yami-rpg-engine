import '@app/legacy/module/command/createGlobalActor.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCreateGlobalActorCommandSchema() {
	return useCommandSchema('createGlobalActor', {
		onLoad() {
			getFocus(document.getElementById('createGlobalActor-actorId')!);
		}
	});
}
