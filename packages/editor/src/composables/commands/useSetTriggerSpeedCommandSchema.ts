import '@app/legacy/module/command/setTriggerSpeed.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTriggerSpeedCommandSchema() {
	return useCommandSchema('setTriggerSpeed', {
		onLoad() {
			getFocus(document.getElementById('setTriggerSpeed-trigger'));
		}
	});
}
