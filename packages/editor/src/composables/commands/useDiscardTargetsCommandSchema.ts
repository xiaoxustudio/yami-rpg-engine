import '@/module/command/discardTargets.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDiscardTargetsCommandSchema() {
	return useCommandSchema('discardTargets', {
		onLoad() {
			getFocus($('#discardTargets-actor'));
		}
	});
}
