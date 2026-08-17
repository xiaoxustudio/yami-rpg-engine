import '@app/legacy/module/command/unloadSubscene.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useUnloadSubsceneCommandSchema() {
	return useCommandSchema('unloadSubscene', {
		onLoad() {
			getFocus($('#unloadSubscene-sceneId'));
		}
	});
}
