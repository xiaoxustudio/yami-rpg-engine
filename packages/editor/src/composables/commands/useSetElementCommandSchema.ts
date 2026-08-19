import '@app/legacy/module/command/setElement.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetElementCommandSchema() {
	return useCommandSchema('setElement', {
		onLoad() {
			getFocus(document.getElementById('setElement-element'));
		}
	});
}
