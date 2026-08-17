import '@app/legacy/module/command/setTriggerAngle.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetTriggerAngleCommandSchema() {
	return useCommandSchema('setTriggerAngle', {
		onLoad() {
			getFocus($('#setTriggerAngle-trigger'));
		}
	});
}
