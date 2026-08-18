import '@app/legacy/module/command/setItem.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetItemCommandSchema() {
	return useCommandSchema('setItem', {
		onLoad() {
			getFocus(document.getElementById('setItem-item'));
		}
	});
}
