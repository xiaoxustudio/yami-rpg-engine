import '@app/legacy/module/command/stopActorAnimation.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useStopActorAnimationCommandSchema() {
	return useCommandSchema('stopActorAnimation', {
		onLoad() {
			getFocus($('#stopActorAnimation-actor'));
		}
	});
}
