import '@app/legacy/module/command/setCursor.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetCursorCommandSchema() {
	return useCommandSchema('setCursor', {
		onLoad() {
			getFocus(document.getElementById('setCursor-image'));
		}
	});
}
