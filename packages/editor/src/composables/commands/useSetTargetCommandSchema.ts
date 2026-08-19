import '@app/legacy/module/command/setTarget.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTargetCommandSchema() {
	return useCommandSchema('setTarget', {
		onLoad() {
			getFocus(document.getElementById('setTarget-actor'));
		}
	});
}
