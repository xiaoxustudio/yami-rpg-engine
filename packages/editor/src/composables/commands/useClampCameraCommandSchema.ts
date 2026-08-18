import '@app/legacy/module/command/clampCamera.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useClampCameraCommandSchema() {
	return useCommandSchema('clampCamera', {
		onLoad() {
			getFocus(document.getElementById('clampCamera-left')!, 'all');
		}
	});
}
