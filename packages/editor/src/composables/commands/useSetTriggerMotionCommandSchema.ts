import '@app/legacy/module/command/setTriggerMotion.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTriggerMotionCommandSchema() {
	return useCommandSchema('setTriggerMotion', {
		onLoad() {
			getFocus(document.getElementById('setTriggerMotion-trigger'));
		}
	});
}
