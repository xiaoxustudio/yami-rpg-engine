import '@/module/command/createGlobalActor.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useCreateGlobalActorCommandSchema() {
	return useCommandSchema('createGlobalActor', {
		onLoad() {
			getFocus($('#createGlobalActor-actorId'));
		}
	});
}
