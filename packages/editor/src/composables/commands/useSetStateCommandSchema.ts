import '@app/legacy/module/command/setState.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetStateCommandSchema() {
	return useCommandSchema('setState', {
		onLoad() {
			getFocus(document.getElementById('setState-state'));
		}
	});
}
