import '@app/legacy/module/command/setCursor.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetCursorCommandSchema() {
	return useCommandSchema('setCursor', {
		onLoad() {
			getFocus($('#setCursor-image'));
		}
	});
}
