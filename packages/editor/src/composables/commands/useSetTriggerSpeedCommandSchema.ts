import '@/module/command/setTriggerSpeed.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTriggerSpeedCommandSchema() {
	return useCommandSchema('setTriggerSpeed', {
		onLoad() {
			getFocus($('#setTriggerSpeed-trigger'));
		}
	});
}
