import '@app/legacy/module/command/setAmbientLight.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetAmbientLightCommandSchema() {
	return useCommandSchema('setAmbientLight', {
		onLoad() {
			getFocus(document.getElementById('setAmbientLight-red')!, 'all');
		}
	});
}
