import '@/module/command/setItem.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetItemCommandSchema() {
	return useCommandSchema('setItem', {
		onLoad() {
			getFocus($('#setItem-item'));
		}
	});
}
