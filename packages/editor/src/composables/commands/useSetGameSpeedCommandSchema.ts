import '@/module/command/setGameSpeed.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetGameSpeedCommandSchema() {
	return useCommandSchema('setGameSpeed', {
		onLoad() {
			getFocus($('#setGameSpeed-speed'), 'all');
		}
	});
}
