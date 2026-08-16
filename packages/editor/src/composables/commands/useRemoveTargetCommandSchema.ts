import '@/module/command/removeTarget.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRemoveTargetCommandSchema() {
	return useCommandSchema('removeTarget', {
		onLoad() {
			getFocus($('#removeTarget-actor'));
		}
	});
}
