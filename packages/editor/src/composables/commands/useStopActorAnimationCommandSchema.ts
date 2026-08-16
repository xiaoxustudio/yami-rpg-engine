import '@/module/command/stopActorAnimation.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useStopActorAnimationCommandSchema() {
	return useCommandSchema('stopActorAnimation', {
		onLoad() {
			getFocus($('#stopActorAnimation-actor'));
		}
	});
}
