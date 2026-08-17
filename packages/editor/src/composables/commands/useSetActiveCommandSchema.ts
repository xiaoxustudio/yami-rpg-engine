import '@app/legacy/module/command/setActive.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetActiveCommandSchema() {
	return useCommandSchema('setActive', {
		onLoad() {
			getFocus($('#setActive-actor'));
		}
	});
}
