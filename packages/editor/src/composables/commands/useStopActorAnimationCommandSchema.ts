import '@app/legacy/module/command/stopActorAnimation.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useStopActorAnimationCommandSchema() {
	return useCommandSchema('stopActorAnimation', {
		onLoad() {
			getFocus(document.getElementById('stopActorAnimation-actor'));
		}
	});
}
