import '@app/legacy/module/command/setWeight.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetWeightCommandSchema() {
	return useCommandSchema('setWeight', {
		onLoad() {
			getFocus(document.getElementById('setWeight-actor'));
		}
	});
}
