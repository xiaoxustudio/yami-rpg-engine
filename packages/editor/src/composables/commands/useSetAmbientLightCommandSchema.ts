import '@/module/command/setAmbientLight.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetAmbientLightCommandSchema() {
	return useCommandSchema('setAmbientLight', {
		onLoad() {
			getFocus($('#setAmbientLight-red'), 'all');
		}
	});
}
