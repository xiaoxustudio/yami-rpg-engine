import '@app/legacy/module/command/wait.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useWaitCommandSchema() {
	return useCommandSchema('wait', {
		onLoad() {
			getFocus(document.getElementById('wait-duration'), 'all');
		}
	});
}
