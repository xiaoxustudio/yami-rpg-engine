import '@/module/command/setTriggerAngle.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTriggerAngleCommandSchema() {
	return useCommandSchema('setTriggerAngle', {
		onLoad() {
			getFocus($('#setTriggerAngle-trigger'));
		}
	});
}
