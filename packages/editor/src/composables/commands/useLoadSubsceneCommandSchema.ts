import '@/module/command/loadSubscene.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useLoadSubsceneCommandSchema() {
	return useCommandSchema('loadSubscene', {
		onLoad() {
			getFocus($('#loadSubscene-sceneId'));
		}
	});
}
