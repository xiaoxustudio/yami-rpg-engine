import '@app/legacy/module/command/appendTarget.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useAppendTargetCommandSchema() {
	return useCommandSchema('appendTarget', {
		onLoad() {
			getFocus(document.getElementById('appendTarget-actor'));
		}
	});
}
