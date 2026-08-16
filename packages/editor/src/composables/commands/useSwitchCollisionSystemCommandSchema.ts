import '@/module/command/switchCollisionSystem.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSwitchCollisionSystemCommandSchema() {
	return useCommandSchema('switchCollisionSystem', {
		onLoad() {
			getFocus($('#switchCollisionSystem-operation'));
		}
	});
}
