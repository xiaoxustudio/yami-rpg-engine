import '@/module/command/setActive.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetActiveCommandSchema() {
	return useCommandSchema('setActive', {
		onLoad() {
			getFocus($('#setActive-actor'));
		}
	});
}
