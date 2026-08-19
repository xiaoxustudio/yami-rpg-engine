import '@app/legacy/module/command/setResolution.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetResolutionCommandSchema() {
	return useCommandSchema('setResolution', {
		onLoad() {
			getFocus(document.getElementById('setResolution-width'), 'all');
		}
	});
}
