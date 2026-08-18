import '@app/legacy/module/command/discardTargets.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useDiscardTargetsCommandSchema() {
	return useCommandSchema('discardTargets', {
		onLoad() {
			getFocus(document.getElementById('discardTargets-actor')!);
		}
	});
}
