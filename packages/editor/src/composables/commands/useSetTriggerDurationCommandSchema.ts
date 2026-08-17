import '@app/legacy/module/command/setTriggerDuration.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTriggerDurationCommandSchema() {
	return useCommandSchema('setTriggerDuration', {
		onLoad() {
			getFocus($('#setTriggerDuration-trigger'));
		}
	});
}
