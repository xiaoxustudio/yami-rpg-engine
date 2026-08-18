import '@app/legacy/module/command/setTriggerDuration.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTriggerDurationCommandSchema() {
	return useCommandSchema('setTriggerDuration', {
		onLoad() {
			getFocus(document.getElementById('setTriggerDuration-trigger'));
		}
	});
}
