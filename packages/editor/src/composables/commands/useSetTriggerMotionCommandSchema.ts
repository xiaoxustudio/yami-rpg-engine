import '@/module/command/setTriggerMotion.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTriggerMotionCommandSchema() {
	return useCommandSchema('setTriggerMotion', {
		onLoad() {
			getFocus($('#setTriggerMotion-trigger'));
		}
	});
}
