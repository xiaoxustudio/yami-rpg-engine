import '@/module/command/setElement.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetElementCommandSchema() {
	return useCommandSchema('setElement', {
		onLoad() {
			getFocus($('#setElement-element'));
		}
	});
}
