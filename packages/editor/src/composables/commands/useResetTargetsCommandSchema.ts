import '@app/legacy/module/command/resetTargets.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useResetTargetsCommandSchema() {
	return useCommandSchema('resetTargets', {
		onLoad() {
			getFocus(document.getElementById('resetTargets-actor'));
		}
	});
}
