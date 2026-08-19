import '@app/legacy/module/command/unloadSubscene.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useUnloadSubsceneCommandSchema() {
	return useCommandSchema('unloadSubscene', {
		onLoad() {
			getFocus(document.getElementById('unloadSubscene-sceneId'));
		}
	});
}
