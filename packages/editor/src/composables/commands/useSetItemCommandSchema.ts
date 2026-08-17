import '@app/legacy/module/command/setItem.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetItemCommandSchema() {
	return useCommandSchema('setItem', {
		onLoad() {
			getFocus($('#setItem-item'));
		}
	});
}
