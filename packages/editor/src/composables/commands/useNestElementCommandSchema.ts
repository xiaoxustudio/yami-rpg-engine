import '@app/legacy/module/command/nestElement.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useNestElementCommandSchema() {
	return useCommandSchema('nestElement', {
		onLoad() {
			getFocus(document.getElementById('nestElement-parent')!);
		}
	});
}
