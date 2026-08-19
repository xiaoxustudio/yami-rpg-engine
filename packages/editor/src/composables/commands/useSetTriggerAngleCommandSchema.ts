import '@app/legacy/module/command/setTriggerAngle.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTriggerAngleCommandSchema() {
	return useCommandSchema('setTriggerAngle', {
		onLoad() {
			getFocus(document.getElementById('setTriggerAngle-trigger'));
		}
	});
}
