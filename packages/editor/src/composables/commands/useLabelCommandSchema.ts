import '@app/legacy/module/command/label.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useLabelCommandSchema() {
	return useCommandSchema('label', {
		onLoad() {
			getFocus(document.getElementById('label-name')!, 'all');
		}
	});
}
