import '@/module/command/activateScene.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useActivateSceneCommandSchema() {
	return useCommandSchema('activateScene', {
		onLoad() {
			getFocus($('#activateScene-pointer'));
		}
	});
}
