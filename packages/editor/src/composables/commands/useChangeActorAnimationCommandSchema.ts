import '@app/legacy/module/command/changeActorAnimation.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorAnimationCommandSchema() {
	return useCommandSchema('changeActorAnimation', {
		onLoad() {
			getFocus(document.getElementById('changeActorAnimation-actor'));
		}
	});
}
