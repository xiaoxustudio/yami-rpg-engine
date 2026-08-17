import '@app/legacy/module/command/switchCollisionSystem.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSwitchCollisionSystemCommandSchema() {
	return useCommandSchema('switchCollisionSystem', {
		onLoad() {
			getFocus($('#switchCollisionSystem-operation'));
		}
	});
}
