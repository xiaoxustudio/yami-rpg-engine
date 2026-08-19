import '@app/legacy/module/command/removeTarget.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRemoveTargetCommandSchema() {
	return useCommandSchema('removeTarget', {
		onLoad() {
			getFocus(document.getElementById('removeTarget-actor'));
		}
	});
}
