import '@app/legacy/module/command/playActorAnimation.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function usePlayActorAnimationCommandSchema() {
	return useCommandSchema('playActorAnimation', {
		onLoad() {
			getFocus($('#playActorAnimation-actor'));
		}
	});
}
