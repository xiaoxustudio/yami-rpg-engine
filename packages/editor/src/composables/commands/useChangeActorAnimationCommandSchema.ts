import '@app/legacy/module/command/changeActorAnimation.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorAnimationCommandSchema() {
	return useCommandSchema('changeActorAnimation', {
		onLoad() {
			getFocus($('#changeActorAnimation-actor'));
		}
	});
}
