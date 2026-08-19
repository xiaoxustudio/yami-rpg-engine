import '@app/legacy/module/command/setPan.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetPanCommandSchema() {
	return useCommandSchema('setPan', {
		onLoad() {
			getFocus(document.getElementById('setPan-type'));
		}
	});
}
