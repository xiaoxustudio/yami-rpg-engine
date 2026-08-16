import '@/module/command/playActorAnimation.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function usePlayActorAnimationCommandSchema() {
	return useCommandSchema('playActorAnimation', {
		onLoad() {
			getFocus($('#playActorAnimation-actor'));
		}
	});
}
