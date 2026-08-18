import '@app/legacy/module/command/setGameSpeed.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetGameSpeedCommandSchema() {
	return useCommandSchema('setGameSpeed', {
		onLoad() {
			getFocus(document.getElementById('setGameSpeed-speed'), 'all');
		}
	});
}
