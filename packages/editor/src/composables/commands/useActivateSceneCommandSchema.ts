import '@app/legacy/module/command/activateScene.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useActivateSceneCommandSchema() {
	return useCommandSchema('activateScene', {
		onLoad() {
			getFocus(document.getElementById('activateScene-pointer')!);
		}
	});
}
