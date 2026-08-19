import '@app/legacy/module/command/shakeScreen.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useShakeScreenCommandSchema() {
	return useCommandSchema('shakeScreen', {
		onLoad() {
			getFocus(document.getElementById('shakeScreen-mode'));
		}
	});
}
