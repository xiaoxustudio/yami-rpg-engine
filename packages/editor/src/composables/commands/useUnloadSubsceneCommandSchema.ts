import '@/module/command/unloadSubscene.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useUnloadSubsceneCommandSchema() {
	return useCommandSchema('unloadSubscene', {
		onLoad() {
			getFocus($('#unloadSubscene-sceneId'));
		}
	});
}
