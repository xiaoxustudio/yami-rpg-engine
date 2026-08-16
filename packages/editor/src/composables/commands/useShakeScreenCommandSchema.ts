import '@/module/command/shakeScreen.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useShakeScreenCommandSchema() {
	return useCommandSchema('shakeScreen', {
		onLoad() {
			getFocus($('#shakeScreen-mode'));
		}
	});
}
