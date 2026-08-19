import '@app/legacy/module/command/setZoomFactor.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetZoomFactorCommandSchema() {
	return useCommandSchema('setZoomFactor', {
		onLoad() {
			getFocus(document.getElementById('setZoomFactor-zoom'), 'all');
		}
	});
}
