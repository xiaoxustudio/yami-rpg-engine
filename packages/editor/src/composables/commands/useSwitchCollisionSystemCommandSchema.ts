import '@app/legacy/module/command/switchCollisionSystem.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSwitchCollisionSystemCommandSchema() {
	return useCommandSchema('switchCollisionSystem', {
		onLoad() {
			getFocus(document.getElementById('switchCollisionSystem-operation'));
		}
	});
}
