import '@app/legacy/module/command/removeTarget.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRemoveTargetCommandSchema() {
	return useCommandSchema('removeTarget', {
		onLoad() {
			getFocus($('#removeTarget-actor'));
		}
	});
}
