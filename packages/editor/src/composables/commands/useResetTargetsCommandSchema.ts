import '@/module/command/resetTargets.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useResetTargetsCommandSchema() {
	return useCommandSchema('resetTargets', {
		onLoad() {
			getFocus($('#resetTargets-actor'));
		}
	});
}
