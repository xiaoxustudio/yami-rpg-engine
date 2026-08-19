import '@app/legacy/module/command/loadSubscene.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useLoadSubsceneCommandSchema() {
	return useCommandSchema('loadSubscene', {
		onLoad() {
			getFocus(document.getElementById('loadSubscene-sceneId')!);
		}
	});
}
