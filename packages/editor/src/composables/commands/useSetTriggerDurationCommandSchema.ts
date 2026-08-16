import '@/module/command/setTriggerDuration.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTriggerDurationCommandSchema() {
	return useCommandSchema('setTriggerDuration', {
		onLoad() {
			getFocus($('#setTriggerDuration-trigger'));
		}
	});
}
