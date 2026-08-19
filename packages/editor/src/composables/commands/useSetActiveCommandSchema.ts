import '@app/legacy/module/command/setActive.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetActiveCommandSchema() {
	return useCommandSchema('setActive', {
		onLoad() {
			getFocus(document.getElementById('setActive-actor')!);
		}
	});
}
