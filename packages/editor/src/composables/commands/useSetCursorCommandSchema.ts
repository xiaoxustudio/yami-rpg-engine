import '@/module/command/setCursor.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetCursorCommandSchema() {
	return useCommandSchema('setCursor', {
		onLoad() {
			getFocus($('#setCursor-image'));
		}
	});
}
